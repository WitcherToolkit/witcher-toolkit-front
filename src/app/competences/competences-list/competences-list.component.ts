import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetenceService } from '../competence.service';
import { CompetencesDetailComponent } from '../competences-detail/competences-detail.component';
import { Competence } from '../../models/competence';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { CompetencesUpdateComponent } from '../competences-update/competences-update.component';
import { ConfirmDeleteModalComponentComponent } from '../../shared/confirm-delete-modal-component/confirm-delete-modal-component.component';
import { AuthService } from '../../shared/shared-services/auth.service';

@Component({
  selector: 'app-competences-list',
  standalone: true,
  imports: [
    SelectionBorderDirective,
    CommonModule,
    CompetencesDetailComponent,
    CompetencesUpdateComponent,
    ConfirmDeleteModalComponentComponent
  ],
  templateUrl: './competences-list.component.html',
  styleUrl: './competences-list.component.scss'
})
export class CompetencesListComponent {
  // --- Services et constantes ---
  private readonly competenceService = inject(CompetenceService);
    readonly auth = inject(AuthService);
  readonly MAX_LENGTH = 100;

  // --- Signaux et propriétés réactives ---
  readonly competences = signal<Competence[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(CompetencesDetailComponent) detailModal!: CompetencesDetailComponent;
  @ViewChild(CompetencesUpdateComponent) updateModal!: CompetencesUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent;
  selectedCompetence: Competence | null = null; // Pour détail/édition
  competenceToDelete: Competence | null = null; // Pour suppression

  // --- Filtres et computed ---
  readonly competencesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allCompetences = this.competences();
    if (!term || allCompetences === undefined || allCompetences.length === 0) {
      return allCompetences || [];
    }
    return allCompetences.filter(competence =>
      competence.nom.toLowerCase().includes(term)
    );
  });

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshCompetences();
  }

  // --- Gestion de la recherche ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales ---
  openModal(competence: Competence) {
    this.selectedCompetence = competence;
    this.detailModal.open();
  }

  openUpdateModal(competence: Competence) {
    this.selectedCompetence = competence;
    this.updateModal.open();
  }

  openCreateModal() {
    this.selectedCompetence = null;
    this.updateModal.open();
  }

  openDeleteModal(competence: Competence) {
    this.competenceToDelete = competence;
    setTimeout(() => {
      if (this.deleteModal) {
        this.deleteModal.open();
      }
      });
    }

  // --- Gestion CRUD ---
  refreshCompetences() {
    this.competenceService.getCompetencesList().subscribe(competences => {
      this.competences.set(competences);
    });
  }

  onCompetenceUpdated(updatedCompetence: Competence) {
    this.refreshCompetences();
  }

  deleteCompetence() {
    if (!this.competenceToDelete) return;
    this.competenceService.deleteCompetence(this.competenceToDelete.idCompetence).subscribe(() => {
      this.refreshCompetences();
      this.competenceToDelete = null;
    });
  }

  // --- Utilitaires ---
  trackById(index: number, competence: Competence): number {
    return competence.idCompetence;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}