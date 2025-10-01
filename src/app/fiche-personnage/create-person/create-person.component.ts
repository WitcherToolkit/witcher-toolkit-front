import { Component, OnDestroy } from '@angular/core';
import { Personnage } from '../../models/personnage';
import { CommonModule } from '@angular/common';
import { Part1IdentityComponent } from "./part1-identity/part1-identity.component";
import { Part3CompetenceComponent } from './part3-competence/part3-competence.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HighlightDirective } from '../../highlight.directive';
import { Router } from '@angular/router';
import { Part2CaracteristiqueComponent } from './part2-caracteristique/part2-caracteristique.component';
import { Profession } from '../../models/profession';
import { Part4MagieComponent } from './part4-magie/part4-magie.component';
import { FichePersonnageService } from '../fiche-personnage.service';
import { Subscription } from 'rxjs';
import { PERSONNAGE_CONSULT_PATH } from '../../app-routing/app-routing-constants';

@Component({
  selector: 'app-create-person',
  imports: [
    CommonModule,
    Part1IdentityComponent,
    Part2CaracteristiqueComponent,
    Part3CompetenceComponent,
    Part4MagieComponent,
    HighlightDirective
  ],
  templateUrl: './create-person.component.html',
  styleUrls: ['./create-person.component.scss'],
})
export class CreatePersonComponent implements OnDestroy {
  currentStep = 1;
  selectedProfession: Profession | undefined = undefined;
  form: FormGroup;
  professions: Profession[] = [];
  
  // Gestion des subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private personnageService: FichePersonnageService
  ) {
    this.form = this.fb.group({});
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Configuration des subscriptions
  private setupFormSubscriptions(): void {
    // Écoute les changements du formulaire pour mettre à jour selectedProfession
    this.subscriptions.push(
      this.form.valueChanges.subscribe(() => {
        const professionValue = this.form.get('profession')?.value;
        if (professionValue && typeof professionValue === 'object') {
          this.selectedProfession = professionValue;
        } else {
          this.selectedProfession = this.professions.find(p => p.idProfession === +professionValue);
        }
      })
    );
  }

  // Méthode appelée par Part1 via @Output pour recevoir les professions
  onProfessionsLoaded(professions: Profession[]): void {
    this.professions = professions;
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      console.log(`Étape ${this.currentStep} :`, this.form.value);
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      console.log(`Étape ${this.currentStep} :`, this.form.value);
      console.log('Formulaire complet au retour arrière :', JSON.stringify(this.form.value, null, 2));
      this.currentStep--;
    }
  }

  submitForm(): void {

    console.log('=== DONNÉES ENVOYÉES ===');
    console.log('Race:', this.form.get('race')?.value);
    console.log('Profession:', this.form.get('profession')?.value);
    console.log('Form complet:', JSON.stringify(this.form.value, null, 2));

    console.log('Form Data:', this.form.value);

    // Vérifie la validité du formulaire
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.error('Le formulaire est invalide. Veuillez corriger les erreurs avant de soumettre.');
      return;
    }

    // Envoi des données au backend
    this.subscriptions.push(
      this.personnageService.createFichePersonnage(this.form.value).subscribe({
        next: (response: any) => {
          console.log('Fiche personnage créée avec succès:', response);
          const id = response.id ?? response.idFichePersonnage;
          
          if (id) {
            this.router.navigate([`/${PERSONNAGE_CONSULT_PATH}`, id]);
          } else {
            console.error('ID de fiche personnage non retourné par le backend.');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création de la fiche personnage:', error);
        }
      })
    );
  }

  getProgressWidth(): string {
    switch (this.currentStep) {
      case 1: return '25%';
      case 2: return '50%';
      case 3: return '75%';
      case 4: return '100%';
      default: return '0%';
    }
  }

  isSubmitAvailableOnPart3(): boolean {
    const professionValue = this.form.get('profession')?.value;
    let selectedProfession: Profession | undefined;
    if (professionValue && typeof professionValue === 'object') {
      selectedProfession = professionValue;
    } else {
      selectedProfession = this.professions.find(p => p.idProfession === +professionValue);
    }
    return !!(
      this.currentStep === 3 && 
      selectedProfession && 
      selectedProfession.nom !== 'Mage' && 
      selectedProfession.nom !== 'Prêtre'
    );
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return (
        (this.form.get('nomPersonnage')?.valid ?? false) &&
        (this.form.get('genre')?.valid ?? false) &&
        (this.form.get('race')?.valid ?? false) &&
        (this.form.get('profession')?.valid ?? false) &&
        (this.form.get('inventaires')?.valid ?? false)
      );
    }
    
    if (this.currentStep === 2) {
      const caracsValid = this.form.get('caracteristiquePersonnageList')?.valid ?? false;
      const poingsExists = this.form.get('poings') !== null;
      const piedsExists = this.form.get('pieds') !== null;
      const vigueurExists = this.form.get('vigueur') !== null;
      const niveauJeuValid = this.form.get('niveauJeu')?.valid ?? false;
      return caracsValid && poingsExists && piedsExists && vigueurExists && niveauJeuValid;
    }
    
    // Pour les autres étapes
    return this.form.valid;
  }
}