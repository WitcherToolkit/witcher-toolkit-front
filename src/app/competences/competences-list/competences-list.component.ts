import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COMPETENCE_LIST } from '../../fake-data-set/competence-fake';
import { CompetenceService } from '../competence.service';

@Component({
  selector: 'app-competences-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competences-list.component.html',
  styles: []
})
export class CompetencesListComponent {
  readonly competences = signal(COMPETENCE_LIST);
  readonly #competenceService = inject(CompetenceService); // injection de la dépendance
  readonly competencesList = signal(this.#competenceService.getCompetencesList()); // récupération de la liste des compétences
  readonly searchTerm = signal(''); // signal pour la recherche

  readonly competencesListFiltered = computed(() => {
    const searchTerm = this.searchTerm();
    const competencesList = this.competencesList();
    // filtrage de la liste des compétences
    if (!searchTerm) return competencesList;
    // sinon on retourne les compétences dont le nom contient le terme de recherche
    return competencesList.filter(competence => competence.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  });

  trackById(index: number, competence: any): number {
    return competence.id;
  }
}