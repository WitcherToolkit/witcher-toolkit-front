import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Competence } from '../../../models/competence';
import { CompetenceService } from '../../../competences/competence.service';
import { ProfessionsService } from '../../../professions/professions.service';

@Component({
  selector: 'app-part3',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './part3-competence.component.html',
  styleUrls: ['./part3-competence.component.scss']
})
export class Part3CompetenceComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  competences: Competence[] = [];
  competencesAssociees: Competence[] = [];
  competencesNonAssociees: Competence[] = [];
  pointsRestants = signal<number>(0);
  pointsDispo: number = 0;
  
  // Gestion des subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private competenceService: CompetenceService,
    private professionsService: ProfessionsService
  ) {}

  ngOnInit() {
    this.initializeFormControls();
    this.loadCompetencesAndSetupSubscriptions();
  }

  ngOnDestroy() {
    // Nettoyer toutes les subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Initialisation des contrôles du formulaire
  private initializeFormControls(): void {
    this.form.addControl('competencePersonnageList', this.fb.array([]));
    this.form.addControl('competences', this.fb.array([]));
    this.form.addControl('competenceSecondaire', this.fb.array([]));
  }

  // Chargement des compétences et configuration des subscriptions
  private loadCompetencesAndSetupSubscriptions(): void {
    this.subscriptions.push(
      this.competenceService.getCompetencesList().subscribe((allCompetences: Competence[]) => {
        this.competences = allCompetences;
        const selectedProfessionId = this.form.get('profession')?.value;
        this.loadProfessionCompetences(selectedProfessionId);
        this.setupFormSubscriptions();
      })
    );
  }

  // Configuration des subscriptions (sans imbrication)
  private setupFormSubscriptions(): void {
    // Changement de profession
    this.subscriptions.push(
      this.form.get('profession')?.valueChanges.subscribe(professionId => {
        this.loadProfessionCompetences(professionId);
      }) || new Subscription()
    );

    // Changement des langues sélectionnées
    this.subscriptions.push(
      this.form.get('languesSelectionnees')?.valueChanges.subscribe(() => {
        this.loadProfessionCompetences(this.form.get('profession')?.value);
      }) || new Subscription()
    );

    // Changement des compétences de combat sélectionnées
    this.subscriptions.push(
      this.form.get('combatSelectionnees')?.valueChanges.subscribe(() => {
        this.loadProfessionCompetences(this.form.get('profession')?.value);
      }) || new Subscription()
    );

    // Changements des compétences associées
    this.subscriptions.push(
      this.competencesArray.valueChanges.subscribe(() => {
        this.updateCompetencePersonnage();
        this.updateAllPoints();
      })
    );

    // Changements des compétences secondaires
    this.subscriptions.push(
      this.competenceSecondaireArray.valueChanges.subscribe(() => {
        this.updateCompetencePersonnage();
        this.updateAllPoints();
      })
    );

    // Initialisation des points
    this.updateAllPoints();
  }

  // Chargement des compétences d'une profession
  private loadProfessionCompetences(professionValue: any): void {
    // Extraire l'ID si c'est un objet, sinon utiliser la valeur directement
    const professionId = typeof professionValue === 'object' && professionValue !== null
      ? professionValue.idProfession
      : professionValue;

    if (!professionId) {
      this.resetCompetences();
      return;
    }

    this.subscriptions.push(
      this.professionsService.getProfessionCompetences(+professionId).subscribe(selectedProfession => {
        this.processCompetences(selectedProfession);
      })
    );
  }

  // Réinitialisation des compétences
  private resetCompetences(): void {
    this.competencesAssociees = [];
    this.competencesNonAssociees = [];
    this.competenceSecondaireArray.clear();
    this.competencesArray.clear();
    this.form.get('competencePersonnageList')?.reset();
  }

  // Traitement des compétences de la profession
  private processCompetences(selectedProfession: any): void {
    const associatedIds = selectedProfession.competenceList?.map((c: any) => c.idCompetence) || [];
    
    // Ajout des compétences de langue et de combat sélectionnées en partie 1
    const languesIds = this.form.get('languesSelectionnees')?.value || [];
    const combatIds = this.form.get('combatSelectionnees')?.value || [];
    const extraIds = [...languesIds, ...combatIds];
    
    // Fusionner sans doublons
    const allAssocIds = Array.from(new Set([...associatedIds, ...extraIds]));
    
    this.competencesAssociees = this.competences.filter(c => 
      allAssocIds.map(String).includes(String(c.idCompetence))
    );
    
    this.competencesNonAssociees = this.competences.filter(c =>
      !allAssocIds.map(String).includes(String(c.idCompetence))
    );
    
    this.populateFormArrays();
  }

  // Remplissage des FormArrays
  private populateFormArrays(): void {
    // Réinitialiser le tableau des compétences associées
    this.competencesArray.clear();
    this.competencesAssociees.forEach(competence => {
      this.competencesArray.push(this.fb.group({
        valeurMax: [0, [Validators.min(0), Validators.max(6)]],
        competence: [competence]
      }));
    });
    
    // Réinitialiser le tableau des compétences non associées
    this.competenceSecondaireArray.clear();
    this.competencesNonAssociees.forEach(competence => {
      this.competenceSecondaireArray.push(this.fb.group({
        valeurMax: [0, [Validators.min(0), Validators.max(6)]],
        competence: [competence]
      }));
    });
    
    this.updateCompetencePersonnage();
  }

  // Getters pour les FormArrays
  get competencesArray(): FormArray {
    return this.form.get('competences') as FormArray;
  }

  get competenceSecondaireArray(): FormArray {
    return this.form.get('competenceSecondaire') as FormArray;
  }

  // Regrouper les compétences du personnage en une liste
  private updateCompetencePersonnage(): void {
    const competences = this.competencesArray.value;
    const competenceSecondaire = this.competenceSecondaireArray.value;
  
    const competencePersonnageArray = this.form.get('competencePersonnageList') as FormArray;
    competencePersonnageArray.clear();
  
    [...competences, ...competenceSecondaire].forEach((c: any) => {
      competencePersonnageArray.push(this.fb.group({
        valeurActuel: [c.valeurMax, [Validators.min(0), Validators.max(6)]],
        competence: [c.competence]
      }));
    });
  }

  // Mise à jour de tous les points
  private updateAllPoints(): void {
    this.calculerPointsDispo();
    this.updatePointsRestants();
  }

  // Mise à jour des points restants
  private updatePointsRestants(): void {
    const totalDepenses = this.competencesArray?.controls.reduce((sum, control) => {
      const competence = control.get('competence')?.value;
      const valeur = control.get('valeurMax')?.value || 0;
      const step = competence?.step || 1;
      return sum + (valeur * step);
    }, 0) || 0;
    
    const pointsTotal = 44;
    this.pointsRestants.set(pointsTotal - totalDepenses);
  }

  // Calcule la somme de INT + RÉF
  private calculerPointsDispo(): void {
    const caracteristiques = this.form.get('caracteristiquePersonnageList')?.value || [];
    const intelligence = caracteristiques.find((c: any) => c.code === 'INT')?.valeurActuelle || 0;
    const reflexe = caracteristiques.find((c: any) => c.code === 'RÉF')?.valeurActuelle || 0;
    const total = intelligence + reflexe;

    const competenceSecondaire = this.competenceSecondaireArray.value || [];
    const depenses = competenceSecondaire.reduce((sum: number, c: any) => sum + (c.valeurMax || 0), 0);
    
    this.pointsDispo = total - depenses;
    console.log(`Points disponibles: ${this.pointsDispo}`);
  }

  // Incrémenter une compétence
  incrementCompetence(index: number, listType: 'competences' | 'competenceSecondaire'): void {
    const formArray = this.getArrayByType(listType);
    const control = formArray.at(index).get('valeurMax');
    if (control && control.value < 6) {
      control.setValue(Math.min(control.value + 1, 6));
    }
  }

  // Décrémenter une compétence
  decrementCompetence(index: number, listType: 'competences' | 'competenceSecondaire'): void {
    const formArray = this.getArrayByType(listType);
    const control = formArray.at(index).get('valeurMax');
    const minValue = 0;
    if (control && control.value > minValue) {
      control.setValue(Math.max(control.value - 1, minValue));
    }
  }
  
  // Vérifier si le bouton décrémentation est désactivé
  isDecrementDisabled(index: number, listType: 'competences' | 'competenceSecondaire'): boolean {
    const control = this.getArrayByType(listType).at(index).get('valeurMax');
    return control ? control.value <= 0 : true;
  }
  
  // Vérifier si le bouton incrémentation est désactivé
  isIncrementDisabled(index: number, listType: 'competences' | 'competenceSecondaire'): boolean {
    const control = this.getArrayByType(listType).at(index).get('valeurMax');
    const competence = this.getArrayByType(listType).at(index).get('competence')?.value;
    const step = competence?.step || 1;
    
    if (listType === 'competences') {
      return control
        ? control.value >= 6 || this.pointsRestants() < step
        : true;
    } else {
      return control
        ? control.value >= 6 || this.pointsDispo < step
        : true;
    }
  }

  // Obtenir le FormArray selon le type
  private getArrayByType(listType: 'competences' | 'competenceSecondaire'): FormArray {
    return listType === 'competences' ? this.competencesArray : this.competenceSecondaireArray;
  }
}