import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class Part3CompetenceComponent implements OnInit {
  @Input() form!: FormGroup;
  competences: Competence[] = [];
  competencesAssociees: Competence[] = [];
  competencesNonAssociees: Competence[] = [];
  pointsRestants = signal<number>(0);
  pointsDispo: number = 0;

  constructor(
    private fb: FormBuilder,
    private competenceService: CompetenceService,
    private professionsService: ProfessionsService
  ) {}

  ngOnInit() {
    this.form.addControl('competencePersonnage', this.fb.array([]));
    this.form.addControl('competences', this.fb.array([]));
    this.form.addControl('competenceSecondaire', this.fb.array([]));
    this.competenceService.getCompetencesList().subscribe((allCompetences: Competence[]) => {
      this.competences = allCompetences;
      const selectedProfessionId = this.form.get('profession')?.value;
      this.loadProfessionCompetences(selectedProfessionId);

      // Synchronisation dynamique avec les sélections de la partie 1
      this.form.get('languesSelectionnees')?.valueChanges.subscribe(() => {
        this.loadProfessionCompetences(this.form.get('profession')?.value);
      });
      this.form.get('combatSelectionnees')?.valueChanges.subscribe(() => {
        this.loadProfessionCompetences(this.form.get('profession')?.value);
      });

      this.form.get('profession')?.valueChanges.subscribe(professionId => {
        this.loadProfessionCompetences(professionId);
      });
    });
    this.updateAllPoints();
    this.competencesArray.valueChanges.subscribe(() => {
      this.updateCompetencePersonnage();
      this.updateAllPoints();
    });
    this.competenceSecondaireArray.valueChanges.subscribe(() => {
      this.updateCompetencePersonnage();
      this.updateAllPoints();
    });
  }

  private updateAllPoints() {
    this.calculerPointsDispo();
    this.updatePointsRestants();
  }

  private loadProfessionCompetences(professionId: number | string) {
    if (!professionId) {
      this.competencesAssociees = [];
      this.competencesNonAssociees = [];
      this.competenceSecondaireArray.clear();
      this.competencesArray.clear();
      this.form.get('competencePersonnage')?.reset();
      return;
    }
    this.professionsService.getProfessionCompetences(+professionId).subscribe(selectedProfession => {
      const associatedIds = selectedProfession.competenceList?.map((c: any) => c.idCompetence) || [];
      // Ajout des compétences de langue et de combat sélectionnées en partie 1
      const languesIds = this.form.get('languesSelectionnees')?.value || [];
      const combatIds = this.form.get('combatSelectionnees')?.value || [];
      const extraIds = [...languesIds, ...combatIds];
      // Fusionner sans doublons
      const allAssocIds = Array.from(new Set([...associatedIds, ...extraIds]));
      this.competencesAssociees = this.competences.filter(c => allAssocIds.map(String).includes(String(c.idCompetence)));
      // Exclure les compétences de langue et de combat sélectionnées des secondaires
      this.competencesNonAssociees = this.competences.filter(c =>
        !allAssocIds.map(String).includes(String(c.idCompetence))
      );
      // Réinitialiser le tableau des compétences associées dans le formulaire
      this.competencesArray.clear();
      this.competencesAssociees.forEach(competence => {
        this.competencesArray.push(this.fb.group({
          valeurMax: [0, [Validators.min(0), Validators.max(6)]],
          competence: [competence]
        }));
      });
      // Réinitialiser le tableau des compétences non associées dans le formulaire
      this.competenceSecondaireArray.clear();
      this.competencesNonAssociees.forEach(competence => {
        this.competenceSecondaireArray.push(this.fb.group({
          valeurMax: [0, [Validators.min(0), Validators.max(6)]],
          competence: [competence]
        }));
      });
      this.updateCompetencePersonnage();
      // this.updatePointsRestants(); // supprimé car valueChanges s'en charge
    });
  }

  // Getter pour accéder au FormArray des compétences associées
  get competencesArray(): FormArray {
    return this.form.get('competences') as FormArray;
  }

  // Getter pour accéder au FormArray des compétences non associées
  get competenceSecondaireArray(): FormArray {
    return this.form.get('competenceSecondaire') as FormArray;
  }

  private initCompetences() {
    if (!this.competences) {
      console.error('Competences are not defined');
      return;
    }
  }

  // Regrouper les compétences du personnage en une liste
  private updateCompetencePersonnage(): void {
    const competences = this.competencesArray.value; // Récupère les compétences associées
    const competenceSecondaire = this.competenceSecondaireArray.value; // Récupère les compétences non associées
  
    // Concaténer les deux listes
    const competencePersonnageArray = this.form.get('competencePersonnage') as FormArray;// Récupère le FormArray competencePersonnage
    competencePersonnageArray.clear();// Vide le FormArray avant de le remplir
  
    [...competences, ...competenceSecondaire].forEach((c: any) => {
      competencePersonnageArray.push(this.fb.group({
        valeurActuel: [c.valeurMax, [Validators.min(0), Validators.max(6)]],
        competence: [c.competence]
      }));
    });
  }

  // Mise à jour des point restant
  private updatePointsRestants() {
    // Calcule la dépense totale de chaque compétence
    const totalDepenses = this.competencesArray?.controls.reduce((sum, control) => {
      const competence = control.get('competence')?.value;
      const valeur = control.get('valeurMax')?.value || 0;
      const step = competence?.step || 1;
      return sum + (valeur * step);
    }, 0) || 0;
    const pointsTotal = 44; // Total de points disponibles
    this.pointsRestants.set(pointsTotal - totalDepenses);
  }

  // Ajout de points de caractéristique
  incrementCompetence(index: number, listType: 'competences' | 'competenceSecondaire'): void {
    const formArray = this.getArrayByType(listType);
    const control = formArray.at(index).get('valeurMax');
    if (control && control.value < 6) {
      control.setValue(Math.min(control.value + 1, 6));
    }
  }

  // Suppression de points de caractéristique
  decrementCompetence(index: number, listType: 'competences' | 'competenceSecondaire'): void {
    const formArray = this.getArrayByType(listType);
    const control = formArray.at(index).get('valeurMax');
    const minValue = 0;
    if (control && control.value > minValue) {
      control.setValue(Math.max(control.value - 1, minValue));
    }
  }
  
  // Griser le bouton si le minimum est atteind
  isDecrementDisabled(index: number, listType: 'competences' | 'competenceSecondaire'): boolean {
    const control = this.getArrayByType(listType).at(index).get('valeurMax');
    return control ? control.value <= 0 : true; // Désactive si valeur ≤ 0
  }
  
  // Griser le bouton si le maximum est atteind
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

  private getArrayByType(listType: 'competences' | 'competenceSecondaire'): FormArray {
    return listType === 'competences' ? this.competencesArray : this.competenceSecondaireArray;
  }

  // Calcule la somme de INT + RÉF
  private calculerPointsDispo() {
    const caracteristiques = this.form.get('caracteristiquePersonnage')?.value || [];
    const intelligence = caracteristiques.find((c: any) => c.code === 'INT')?.valeurActuelle || 0;
    const reflexe = caracteristiques.find((c: any) => c.code === 'RÉF')?.valeurActuelle || 0;
    const total = intelligence + reflexe;

    // Calculer les points déjà dépensés dans les compétences non associées
    const competenceSecondaire = this.competenceSecondaireArray.value || [];
    const depenses = competenceSecondaire.reduce((sum: number, c: any) => sum + (c.valeurMax || 0), 0);
    
    this.pointsDispo = total - depenses;
    console.log(`Points disponibles: ${this.pointsDispo}`);
  }
}