import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';
import { ProfessionsService } from '../professions.service';
import { PROFESSION_LIST_PATH } from '../../app-routing/app-routing-constants';
import { Profession } from '../../models/profession';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Competence } from '../../models/competence';
import { CompetenceService } from '../../competences/competence.service';

declare var M: any;

@Component({
  selector: 'app-professions-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],
  templateUrl: './professions-update.component.html',
  styleUrl: './professions-update.component.scss'
})
export class ProfessionsUpdateComponent implements OnInit, AfterViewInit {
  // --- Propriétés et services ---
  readonly professionListPath = PROFESSION_LIST_PATH;
  professionForm!: FormGroup;
  profession: Profession | null = null;
  competences: Competence[] = [];

  @ViewChild('competenceSelect') competenceSelect!: ElementRef;

  private selectInstance: any;

  constructor(
    private fb: FormBuilder,
    private professionsService: ProfessionsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private competencesService: CompetenceService
  ) {}

  // --- Initialisation et chargement des données ---
  ngAfterViewInit() {
    // Ne rien faire ici pour éviter les conflits d'initialisation Materialize
  }

  private initMaterializeSelect() {
    if (this.competenceSelect && this.competenceSelect.nativeElement) {
      if (this.selectInstance) {
        this.selectInstance.destroy();
      }
      this.selectInstance = M.FormSelect.init(this.competenceSelect.nativeElement);
    }
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.competencesService.getCompetencesList().subscribe((competences) => {
      this.competences = competences;
      console.log('Compétences chargées:', this.competences);
      this.initForm();
      this.cdr.detectChanges();
      setTimeout(() => this.initMaterializeSelect());
    });
  }

  // --- Initialisation du formulaire principal ---
  initForm() {
    this.cdr.detectChanges();
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
      competenceList: [this.profession?.competenceList ?? [], [Validators.required]]
    });
  }

  // --- Soumission du formulaire (création ou édition) ---
  onSubmit() {
    if(!this.professionForm.valid) {
      this.professionForm.markAllAsTouched();
      console.error('Le formulaire n\'est pas valide. Veuillez corriger les erreurs.');
      return;
    }
    const idProfession = this.profession?.idProfession;
    const inventaireWikiList = this.professionForm.value.inventaireWikiList.map((item: any, idx: number) => {
      const original = this.profession?.inventaireWikiList?.[idx];
      const base = {
        ...item,
        idInventaireWiki: original?.idInventaireWiki ?? null
      };
      return idProfession ? { ...base, profession: { idProfession } } : base;
    });
    const updatedProfession = {
      ...this.profession,
      ...this.professionForm.value,
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

  // --- Réinitialise le formulaire aux valeurs de l'objet 'profession' (édition) ---
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
      this.professionForm.markAsPristine();
      this.professionForm.markAsUntouched();
    }
  }

  // --- Annulation : retour à la liste ---
  onCancel() {
    this.router.navigate(['/', ...this.professionListPath.split('/')]);
  }

  // --- Gestion de l'inventaire (FormArray) ---
  get inventaireWikiFormArray(): FormArray<FormGroup> {
    return this.professionForm.get('inventaireWikiList') as FormArray;
  }

  /** Ajoute un item d'inventaire */
  addInventaireWiki() {
    this.inventaireWikiFormArray.push(this.fb.group({
      quantite: ['', [Validators.required, Validators.min(0)]],
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['', [Validators.maxLength(10)]],
      effet: [''],
      special: [false]
    }));
  }

  /** Supprime un item d'inventaire */
  removeInventaireWiki(index: number) {
    this.inventaireWikiFormArray.removeAt(index);
  }

  /** Modifie la quantité d'un item d'inventaire */
  updateQuantite(index: number, delta: number, min: number = 0): void {
    const ctrl = this.inventaireWikiFormArray.at(index).get('quantite');
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }

  // --- Outils UI ---
  /** Incrémente/décrémente un champ numérique du formulaire principal */
  updateField(field: string, delta: number, min: number = 0) {
    const ctrl = this.professionForm.get(field);
    if (ctrl) {
      const value = +ctrl.value || 0;
      ctrl.setValue(Math.max(value + delta, min));
    }
  }
}
