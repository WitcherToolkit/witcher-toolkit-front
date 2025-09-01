import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { EnvoutementService } from '../envoutement.service';
import { DangerBorderDirective } from '../../directives/danger-border.directive';
import { CommonModule } from '@angular/common';
import { EnvoutementsDetailComponent } from '../envoutements-detail/envoutements-detail.component';
import { Envoutement } from '../../models/envoutement';
import { EnvoutementsUpdateComponent } from '../envoutements-update/envoutements-update.component';
import { ConfirmDeleteModalComponentComponent } from '../../shared/confirm-delete-modal-component/confirm-delete-modal-component.component';

@Component({
  selector: 'app-envoutements-list',
  standalone: true,
  imports: [
    DangerBorderDirective,
    CommonModule,
    EnvoutementsDetailComponent,
    EnvoutementsUpdateComponent,
    ConfirmDeleteModalComponentComponent
  ],
  templateUrl: './envoutements-list.component.html',
  styleUrls: ['envoutements-list.component.scss']
})
export class EnvoutementsListComponent implements OnInit {
  // --- Services et constantes ---
  private readonly envoutementService = inject(EnvoutementService);
  readonly MAX_LENGTH = 100;

  // --- Signaux et propriétés réactives ---
  envoutements = signal<Envoutement[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(EnvoutementsDetailComponent) detailModal!: EnvoutementsDetailComponent;
  @ViewChild(EnvoutementsUpdateComponent) updateModal!: EnvoutementsUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent;
  selectedEnvoutement: Envoutement | null = null; // Pour détail/édition
  envoutementToDelete: Envoutement | null = null; // Pour suppression

  // --- Filtres et computed ---
  readonly envoutementsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allEnvoutements = this.envoutements();
    if (!term || allEnvoutements === undefined || allEnvoutements.length === 0) {
      return allEnvoutements || [];
    }
    return allEnvoutements.filter(envoutement =>
      envoutement.nom.toLowerCase().includes(term)
    );
  });

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshEnvoutements();
  }

  // --- Gestion de la recherche ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales ---
  openModal(envoutement: Envoutement) {
    this.selectedEnvoutement = envoutement;
    this.detailModal.open();
  }

  openUpdateModal(envoutement: Envoutement) {
    this.selectedEnvoutement = envoutement;
    this.updateModal.open();
  }

  openCreateModal() {
    this.selectedEnvoutement = null;
    this.updateModal.open();
  }

  openDeleteModal(envoutement: Envoutement) {
    this.envoutementToDelete = envoutement;
    setTimeout(() => {
      if (this.deleteModal) {
        this.deleteModal.open();
      }
    });
  }

  // --- Gestion CRUD ---
  refreshEnvoutements() {
    this.envoutementService.getEnvoutementList().subscribe(envoutements => {
      this.envoutements.set(envoutements);
    });
  }

  onEnvoutementUpdated(updatedEnvoutement: Envoutement) {
    this.refreshEnvoutements();
  }

  deleteEnvoutement() {
    if (!this.envoutementToDelete) return;
    this.envoutementService.deleteEnvoutement(this.envoutementToDelete.idEnvoutement).subscribe(() => {
      this.refreshEnvoutements();
      this.envoutementToDelete = null;
    });
  }

  // --- Utilitaires ---
  trackById(index: number, envoutement: Envoutement): number {
    return envoutement.idEnvoutement;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}
