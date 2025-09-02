import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Competence } from '../../../models/competence';
import { ToolsService } from '../../../tools/tools.service';
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
export class Part3CompetenceComponent implements OnInit {
  @Input() form!: FormGroup;
  competences: Competence[] = [];
  filteredCompetences: Competence[] = [];
  pointsRestants = signal<number>(0);
  pointsDispo: number = 0;

  constructor(
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private competenceService: CompetenceService,
    private professionsService: ProfessionsService
  ) {}

  ngOnInit() {
    this.form.addControl('competencePersonnage', this.fb.array([]));
    this.form.addControl('competences', this.fb.array([]));
    this.form.addControl('nonAssociatedCompetences', this.fb.array([]));
    this.competenceService.getCompetencesList().subscribe((competences: Competence[]) => {
      this.competences = competences;
      const selectedProfessionId = this.form.get('profession')?.value;
      this.filterCompetences(selectedProfessionId);
    });
    this.calculerPointsDispo();
    this.form.get('profession')?.valueChanges.subscribe(professionId => {
      this.filterCompetences(professionId);
    });
    this.competencesArray.valueChanges.subscribe(() => {
      this.updatePointsRestants();
      this.updateCompetencePersonnage();
    });
    this.nonAssociatedCompetencesArray.valueChanges.subscribe(() => {
      this.calculerPointsDispo();
      this.updateCompetencePersonnage();
    });
  }

  // Getter pour accéder au FormArray des compétences associées
  get competencesArray(): FormArray {
    return this.form.get('competences') as FormArray;
  }

  // Getter pour accéder au FormArray des compétences non associées
  get nonAssociatedCompetencesArray(): FormArray {
    return this.form.get('nonAssociatedCompetences') as FormArray;
  }

  private initCompetences() {
    if (!this.competences) {
      console.error('Competences are not defined');
      return;
    }
  }

  // Filtre des compétences
  private filterCompetences(professionId: number | string) {
    if (!professionId) {
      this.filteredCompetences = [];
      this.nonAssociatedCompetencesArray.clear();
      this.competencesArray.clear();
      this.form.get('competencePersonnage')?.reset();
      return;
    }

    this.professionsService.getProfessionCompetences(+professionId).subscribe(selectedProfession => {
      // Filtrer les compétences associées à la profession sélectionnée
      this.filteredCompetences = this.competences.filter(competence =>
        selectedProfession.competenceList?.some((profComp: any) => profComp.idCompetence === competence.idCompetence)
      );
      // Filtrer les compétences non associées à la profession sélectionnée
      const nonAssociatedCompetences = this.competences.filter(competence =>
        !selectedProfession.competenceList?.some((profComp: any) => profComp.idCompetence === competence.idCompetence) && !competence.exclusive
      );
      // Réinitialiser le tableau des compétences associées dans le formulaire
      this.competencesArray.clear();
      this.filteredCompetences.forEach(competence => {
        this.competencesArray.push(this.fb.group({
          valeurMax: [1, [Validators.min(1), Validators.max(6)]],
          competence: [competence]
        }));
      });
      // Réinitialiser le tableau des compétences non associées dans le formulaire
      this.nonAssociatedCompetencesArray.clear();
      nonAssociatedCompetences.forEach(competence => {
        this.nonAssociatedCompetencesArray.push(this.fb.group({
          valeurMax: [0, [Validators.min(0), Validators.max(6)]],
          competence: [competence]
        }));
      });
      // Mettre à jour competencePersonnage
      this.updateCompetencePersonnage();
      // Recalculer les points restants
      this.updatePointsRestants();
    });
  }

  // Regrouper les compétences du personnage en une liste
  private updateCompetencePersonnage(): void {
    const competences = this.competencesArray.value; // Récupère les compétences associées
    const nonAssociatedCompetences = this.nonAssociatedCompetencesArray.value; // Récupère les compétences non associées
  
    // Concaténer les deux listes
    const competencePersonnageArray = this.form.get('competencePersonnage') as FormArray;// Récupère le FormArray competencePersonnage
    competencePersonnageArray.clear();// Vide le FormArray avant de le remplir
  
    [...competences, ...nonAssociatedCompetences].forEach((c: any) => {
      competencePersonnageArray.push(this.fb.group({
        valeurActuel: [c.valeurMax, [Validators.min(0), Validators.max(6)]],
        competence: [c.competence]
      }));
    });
  }

  // Mise à jour des point restant
  private updatePointsRestants() {
    const totalDepenses = this.competencesArray?.controls.reduce((sum, control) => {
      return sum + (control.get('valeurMax')?.value || 0);
    }, 0) || 0; // Si le tableau est vide, la somme est 0
  
    const pointsTotal = 44; // Total de points disponibles
    this.pointsRestants.set(pointsTotal - totalDepenses);
  }

  // Ajout de points de caractéristique
  incrementCompetence(index: number, listType: 'competences' | 'nonAssociatedCompetences'): void {
    const formArray = this.getArrayByType(listType);
    this.toolsService.incrementFormControlValue(formArray, index, 'valeurMax', 6);
  }
    // Supression de points de caractéristique

  decrementCompetence(index: number, listType: 'competences' | 'nonAssociatedCompetences'): void {
    const formArray = this.getArrayByType(listType);
    this.toolsService.decrementFormControlValue(formArray, index, 'valeurMax', 0); // ou autre valeur minimale si applicable
  }
  
  // Griser le bouton si le minimum est atteind
  isDecrementDisabled(index: number, listType: 'competences' | 'nonAssociatedCompetences'): boolean {
    const control = this.getArrayByType(listType).at(index).get('valeurMax');
    if (listType === 'competences') {
    return control ? control.value <= 1 : true; // Désactive si valeur ≤ 1
    } else {
      return control ? control.value <= 0 : true; // Désactive si valeur ≤ 0
    }
  }
  
  // Griser le bouton si le maximum est atteind
  isIncrementDisabled(index: number, listType: 'competences' | 'nonAssociatedCompetences'): boolean {
    const control = this.getArrayByType(listType).at(index).get('valeurMax');
    //si listeType est 'competences'
    if (listType === 'competences') {
      return control ? control.value >= 6 || this.pointsRestants() <= 0 : true;
    } else 
      return control ? control.value >= 6 || this.pointsDispo <= 0 : true; // Désactive si valeur ≥ 6 ou si les points disponibles sont insuffisants
  }

  private getArrayByType(listType: 'competences' | 'nonAssociatedCompetences'): FormArray {
    return listType === 'competences' ? this.competencesArray : this.nonAssociatedCompetencesArray;
  }

  // Calcule la somme de INT + RÉF
  private calculerPointsDispo() {
    const caracteristiques = this.form.get('caracteristiquePersonnage')?.value || [];
    const intelligence = caracteristiques.find((c: any) => c.code === 'INT')?.valeurActuelle || 0;
    const reflexe = caracteristiques.find((c: any) => c.code === 'RÉF')?.valeurActuelle || 0;
    const total = intelligence + reflexe;

    // Calculer les poinnts déjà dépensés dans les compétences non associées
    const nonAssociatedCompetences = this.nonAssociatedCompetencesArray.value || [];
    const depenses = nonAssociatedCompetences.reduce((sum: number, c: any) => sum + (c.valeurMax || 0), 0);
    
    this.pointsDispo = total - depenses;
    console.log(`Points disponibles: ${this.pointsDispo}`);
  }
}