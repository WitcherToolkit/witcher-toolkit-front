import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetenceService } from '../competence.service';
import { CompetencesDetailComponent } from '../competences-detail/competences-detail.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Competence } from '../../models/competence';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { CompetencesUpdateComponent } from '../competences-update/competences-update.component';

@Component({
  selector: 'app-competences-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, CompetencesDetailComponent, CompetencesUpdateComponent],
  templateUrl: './competences-list.component.html',
  styleUrl: './competences-list.component.scss'
})
export class CompetencesListComponent {
  private readonly competenceService = inject(CompetenceService);

  readonly MAX_LENGTH = 100;
  readonly competences = signal<Competence[]>([]);

  readonly searchTerm = signal('');
  
  readonly competencesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase(); // Terme de recherche actuel
    const allCompetences = this.competences(); // Tous les competences chargés (c'est un signal !)

    if (!term || allCompetences === undefined || allCompetences.length === 0) {
      return allCompetences || []; // Retourne tous les competences si le terme est vide ou si pas de données
    }

    return allCompetences.filter(competence =>
      competence.nom.toLowerCase().includes(term)
    );
  });

  // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  trackById(index: number, competence: any): number {
    return competence.id;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
  
  //#Region boite de rialogue
    @ViewChild(CompetencesDetailComponent) detailModal!: CompetencesDetailComponent;
    @ViewChild(CompetencesUpdateComponent) updateModal!: CompetencesUpdateComponent;

    // Ajoute une propriété pour la Competence sélectionnée
    selectedCompetence: Competence | null = null;
  
    // Modifie openModal pour recevoir le competence
    openModal(competence: Competence) {
      this.selectedCompetence = competence;
      this.detailModal.open();
    }

    openUpdateModal(competence: Competence) {
      this.selectedCompetence = competence;
      this.updateModal.open();
    }
    //#EndRegion boite de dialogue

    // #Region MAJ des competences après une action
      ngOnInit() {
        this.refreshCompetences();
      }
    
    // Ajoute une méthode pour rafraîchir la liste
    refreshCompetences() {
      // Recharge la liste depuis le service
      this.competenceService.getCompetencesList().subscribe(competences => {
        this.competences.set(competences);
      });
    }
  
    onCompetenceUpdated(updatedCompetence: Competence) {
      this.refreshCompetences();
    }
    // #EndRegion MAJ des competences après une action

}