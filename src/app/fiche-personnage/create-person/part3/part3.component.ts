import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Competence } from '../../../models/competence';
import { COMPETENCE_LIST } from '../../../fake-data-set/competence-fake';
import { PROFESSION_LIST } from '../../../fake-data-set/profession-fake';

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

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.addControl('competences', this.fb.array([]));
    this.form.addControl('nonAssociatedCompetences', this.fb.array([])); // Ajouter un FormArray pour les compétences non associées
    this.initCompetences();

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

  private filterCompetences(professionId: number | string) {
    if (!professionId) {
      this.filteredCompetences = [];
      this.nonAssociatedCompetencesArray.clear();
      this.competencesArray.clear();
      return;
    }
  
    // Convertir l'ID de la profession en un objet profession
    const selectedProfession = PROFESSION_LIST.find(prof => prof.id === +professionId);
    if (!selectedProfession) {
      console.error(`Profession with ID ${professionId} not found.`);
      this.filteredCompetences = [];
      this.nonAssociatedCompetencesArray.clear();
      this.competencesArray.clear();
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
  
    // Recalculer les points restants
    this.updatePointsRestants();
  }

  private updatePointsRestants() {
    const totalDepenses = this.competencesArray?.controls.reduce((sum, control) => {
      return sum + (control.get('valeurMax')?.value || 0);
    }, 0) || 0; // Si le tableau est vide, la somme est 0
  
    const pointsTotal = 44; // Total de points disponibles
    this.pointsRestants.set(pointsTotal - totalDepenses);
  }
}