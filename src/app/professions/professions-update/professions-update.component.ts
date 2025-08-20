
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { ProfessionsService } from '../professions.service';
import { Competence } from '../../models/competence';
import { CompetenceService } from '../../competences/competence.service';
import { PROFESSION_LIST_PATH } from '../../app-routing/app-routing-constants';
import { Profession } from '../../models/profession';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-professions-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './professions-update.component.html',
  styleUrl: './professions-update.component.scss'
})
export class ProfessionsUpdateComponent implements OnInit {
  readonly professionListPath = PROFESSION_LIST_PATH;
  professionForm! : FormGroup;
  profession: Profession | null = null;

  allCompetences: Competence[] = [];


  constructor(
    private fb: FormBuilder, 
    private professionsService: ProfessionsService, 
    private competenceService: CompetenceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.competenceService.getCompetencesList().subscribe(list => {
      this.allCompetences = list;
    });
    if (idParam) {
      // Mode édition
      const id = Number(idParam);
      this.professionsService.getProfessionCompetences(id).subscribe(profession => {
        this.profession = profession;
        this.initForm();
      });
    } else {
      // Mode création
      this.profession = null;
      this.initForm();
    }
  }

  initForm() {
  this.professionForm = this.fb.group({
    nom: [this.profession?.nom ?? '', [Validators.required, Validators.maxLength(50)]],
    description: [this.profession?.description ?? '', [Validators.required]],
    vigueur: [this.profession?.vigueur ?? null],
    nbObjet: [this.profession?.nbObjet ?? 0, [Validators.required, Validators.min(0)]],
    maxSort: [this.profession?.maxSort ?? 0, [Validators.required, Validators.min(0)]],
    maxRituel: [this.profession?.maxRituel ?? 0, [Validators.required, Validators.min(0)]],
    maxEnvoutement: [this.profession?.maxEnvoutement ?? 0, [Validators.required, Validators.min(0)]],
    maxInvocation: [this.profession?.maxInvocation ?? 0, [Validators.required, Validators.min(0)]],
    inventaireWikiList: this.fb.array(
      (this.profession?.inventaireWikiList ?? []).map(item =>
        this.fb.group({
          quantite: [item.quantite, [Validators.required, Validators.min(0)]],
          nom: [item.nom, [Validators.required, Validators.maxLength(50)]],
          type: [item.type, [Validators.maxLength(10)]],
          effet: [item.effet],
          special: [!!item.special]
        })
      )
    ),
    competenceList: this.fb.array(
      (this.profession?.competenceList ?? []).map(cp =>
        this.fb.control(cp.competence.idCompetence)
      )
    )
  });
}

  onSubmit() {
  if(!this.professionForm.valid) {
    this.professionForm.markAllAsTouched();
    console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
    return;
  }

  // Mapping DTO attendu par le backend
  const competenceIds = this.professionForm.value.competenceList;
  const idProfession = this.profession?.idProfession;
  const competenceList = competenceIds.map((id: number) => {
    const competenceObj = this.allCompetences.find(c => c.idCompetence === id);
    return {
      idProfession: idProfession,
      idCompetence: id,
      competence: competenceObj
    };
  });

  const inventaireWikiList = this.professionForm.value.inventaireWikiList.map((item: any, idx: number) => {
    const original = this.profession?.inventaireWikiList[idx];
    return {
      ...item,
      idInventaireWiki: original?.idInventaireWiki ?? null,
      profession: { idProfession }
    };
  });

  const updatedProfession = {
    ...this.profession,
    ...this.professionForm.value,
    competenceList,
    inventaireWikiList
  };

  let professionObservable: Observable<Profession>;
  if(this.profession){
    professionObservable = this.professionsService.updateProfession(updatedProfession);
  } else {
    professionObservable = this.professionsService.createProfession(updatedProfession);
  }

  professionObservable.subscribe({
    next: () => this.router.navigate(['/', ...this.professionListPath.split('/')]),
    error: (err) => console.error('Erreur lors de la sauvegarde de la profession', err)
  });
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

      // Réinitialiser l'inventaire
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
      // Réinitialiser les compétences
      const competenceArray = this.competenceListFormArray;
      competenceArray.clear();
      if (this.profession.competenceList) {
        this.profession.competenceList.forEach(cp => {
          competenceArray.push(this.fb.control(cp.competence.idCompetence));
        });
      }

      this.professionForm.markAsPristine();
      this.professionForm.markAsUntouched();
      setTimeout(() => this.initMaterializeAutocomplete(), 0);
    }
  }

  // Méthode pour gérer l'annulation : réinitialise le formulaire et ferme la modale
  onCancel() {
    this.router.navigate(['/', ...this.professionListPath.split('/')]);
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

  
  // Méthode pour modifier la quantité d'un item d'inventaire
  updateQuantite(index: number, delta: number, min: number = 0): void {
    const array = this.inventaireWikiFormArray;
    const ctrl = array.at(index).get('quantite');
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }
  //#endregion pour l'inventaire

  //#region pour les compétences
  get competenceListFormArray(): FormArray {
    return this.professionForm.get('competenceList') as FormArray;
  }

  addCompetence(id: number) {
    if (!this.competenceListFormArray.value.includes(id)) {
      this.competenceListFormArray.push(this.fb.control(id));
      setTimeout(() => this.initMaterializeAutocomplete(), 0);
    }
  }

  removeCompetence(id: number) {
    const idx = this.competenceListFormArray.value.indexOf(id);
    if (idx > -1) {
      this.competenceListFormArray.removeAt(idx);
      setTimeout(() => this.initMaterializeAutocomplete(), 0);
    }
  }

  onCompetenceSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (value) {
      this.addCompetence(Number(value));
      select.value = ""; // pour réinitialiser la sélection
    }
  }

  get selectedCompetences() {
    return this.competenceListFormArray.value
      .map((id: number) => this.allCompetences.find(c => c.idCompetence === id))
      .filter((c: Competence | undefined): c is Competence => !!c);
  }

  get availableCompetences() {
    return this.allCompetences.filter(
      c => !this.competenceListFormArray.value.includes(c.idCompetence)
    );
  }
  //#endregion pour les compétences

  //-----------------------------------------------------//
  updateField(field: string, delta: number, min: number = 0) {
    const ctrl = this.professionForm.get(field);
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }

  initMaterializeAutocomplete() {
    /*if (this.competenceAutocompleteRef) {
      const data: { [key: string]: null } = {};
      this.availableCompetences.forEach(c => data[c.nom] = null);

      const instance = M.Autocomplete.init(this.competenceAutocompleteRef.nativeElement, {
        data,
        onAutocomplete: (selected: string) => {
          const comp = this.allCompetences.find(c => c.nom === selected);
          if (comp) {
            this.addCompetence(comp.idCompetence);
            this.competenceAutocompleteRef.nativeElement.value = '';
            setTimeout(() => this.initMaterializeAutocomplete(), 0);
          }
        }
      });
    }*/
  }
}
