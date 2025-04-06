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
  private readonly competenceService = inject(CompetenceService);

  readonly searchTerm = signal('');
  
  readonly competencesListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.competenceService.searchCompetences(term);
  });

  // Pour un futur appel API avec Observable + toSignal
  // readonly competencesList = toSignal(this.competenceService.getCompetencesList());

  trackById(index: number, competence: any): number {
    return competence.id;
  }
}