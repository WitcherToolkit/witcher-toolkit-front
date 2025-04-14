import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Competence } from '../../../models/competence';
import { COMPETENCE_LIST } from '../../../fake-data-set/competence-fake';
import { PROFESSION_LIST } from '../../../fake-data-set/profession-fake';
import { CompetencePersonnage } from '../../../models/competence-personnage';
import { ToolsService } from '../../../tools/tools.service';

@Component({
  selector: 'app-part3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part3.component.html',
  styles: []
})
export class Part3Component implements OnInit {
  @Input() form!: FormGroup;
  competences: Competence[] = COMPETENCE_LIST;
  filteredCompetences: Competence[] = []; // Liste des compétences filtrées
  pointsRestants = signal<number>(0);
  pointsDispo: number = 0;

  constructor(private fb: FormBuilder, private toolsService: ToolsService) {}

  ngOnInit() {
    this.form.addControl('competencePersonnage', this.fb.array([]));
    this.form.addControl('competences', this.fb.array([]));
    this.form.addControl('nonAssociatedCompetences', this.fb.array([])); // Ajouter un FormArray pour les compétences non associées
    this.initCompetences();
    this.calculerPointsDispo(); 

    // Écoute les changements de la profession sélectionnée
    this.form.get('profession')?.valueChanges.subscribe(professionId => {
      this.filterCompetences(professionId);
    });

    // Initialisation des compétences filtrées
    const selectedProfessionId = this.form.get('profession')?.value;
    this.filterCompetences(selectedProfessionId);

    // Écoute les changements des valeurs des compétences
    this.competencesArray.valueChanges.subscribe(() => {
      this.updatePointsRestants();
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
  
    // Convertir l'ID de la profession en un objet profession
    const selectedProfession = PROFESSION_LIST.find(prof => prof.id === +professionId);
    if (!selectedProfession) {
      console.error(`Profession with ID ${professionId} not found.`);
      this.filteredCompetences = [];
      this.nonAssociatedCompetencesArray.clear();
      this.competencesArray.clear();
      this.form.get('competencePersonnage')?.reset();
      return;
    }
  
    // Filtrer les compétences associées à la profession sélectionnée
    this.filteredCompetences = this.competences.filter(competence =>
      competence.professions?.some(prof => prof.id === selectedProfession.id)
    );
  
    // Filtrer les compétences non associées à la profession sélectionnée
    const nonAssociatedCompetences = this.competences.filter(competence =>
      !competence.professions?.some(prof => prof.id === selectedProfession.id) && !competence.exclusif
    );
  
    // Réinitialiser le tableau des compétences associées dans le formulaire
    this.competencesArray.clear();
    this.filteredCompetences.forEach(competence => {
      this.competencesArray.push(this.fb.group({
        valeurMax: [1, [Validators.min(1), Validators.max(6)]], // Valeur minimale 1, maximale 6
        competence: [competence]
      }));
    });
  
    // Réinitialiser le tableau des compétences non associées dans le formulaire
    this.nonAssociatedCompetencesArray.clear();
    nonAssociatedCompetences.forEach(competence => {
      this.nonAssociatedCompetencesArray.push(this.fb.group({
        valeurMax: [0, [Validators.min(0), Validators.max(6)]], // Valeur minimale 0, maximale 6
        competence: [competence]
      }));
    });
  
    // Mettre à jour competencePersonnage
    this.updateCompetencePersonnage();
  
    // Recalculer les points restants
    this.updatePointsRestants();
  }

  // Regrouper les compétences du personnage en une liste
  private updateCompetencePersonnage(): void {
    const competences = this.competencesArray.value; // Récupère les compétences associées
    const nonAssociatedCompetences = this.nonAssociatedCompetencesArray.value; // Récupère les compétences non associées
  
    // Concaténer les deux listes
    const competencePersonnageArray = this.form.get('competencePersonnage') as FormArray;
    competencePersonnageArray.clear();
  
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
    return control ? control.value <= 0 : true; // Désactive si valeur ≤ 0
  }
  
  // Griser le bouton si le maximum est atteind
  isIncrementDisabled(index: number, listType: 'competences' | 'nonAssociatedCompetences'): boolean {
    const control = this.getArrayByType(listType).at(index).get('valeurMax');
    return control ? control.value >= 6 : true; // Désactive si valeur ≥ 6
  }

  private getArrayByType(listType: 'competences' | 'nonAssociatedCompetences'): FormArray {
    return listType === 'competences' ? this.competencesArray : this.nonAssociatedCompetencesArray;
  }

  // Calcule la somme de INT + RÉF
  private calculerPointsDispo() {
    const caracteristiques = this.form.get('caracteristiquePersonnage')?.value || [];
    const intelligence = caracteristiques.find((c: any) => c.code === 'INT')?.valeurActuelle || 0;
    const reflexe = caracteristiques.find((c: any) => c.code === 'RÉF')?.valeurActuelle || 0;

    this.pointsDispo = intelligence + reflexe;
    console.log(`Points disponibles: ${this.pointsDispo}`);
  }
}