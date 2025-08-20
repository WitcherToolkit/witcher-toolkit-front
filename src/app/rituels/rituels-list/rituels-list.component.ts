import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RituelsService } from '../rituels.service';
import { Rituel } from '../../models/rituel';
import { RituelsDetailComponent } from '../rituels-detail/rituels-detail.component';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { RituelsUpdateComponent } from '../rituels-update/rituels-update.component';
import { ConfirmDeleteModalComponentComponent } from '../../shared-components/confirm-delete-modal-component/confirm-delete-modal-component.component';

@Component({
  selector: 'app-rituels-list',
  standalone: true,
  imports: [
    SelectionBorderDirective,
    CommonModule,
    RituelsDetailComponent,
    RituelsUpdateComponent,
    ConfirmDeleteModalComponentComponent
  ],
  templateUrl: './rituels-list.component.html',
  styleUrl: './rituels-list.component.scss'
})
export class RituelsListComponent {
  // --- Services et constantes ---
  private readonly rituelsService = inject(RituelsService);
  readonly MAX_LENGTH = 100;

  // --- Signaux et propriétés réactives ---
  readonly rituels = signal<Rituel[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(RituelsDetailComponent) detailModal!: RituelsDetailComponent;
  @ViewChild(RituelsUpdateComponent) updateModal!: RituelsUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent;
  selectedRituel: Rituel | null = null; // Rituel sélectionné pour détail/édition/suppression

  // --- Filtres et computed ---
  readonly rituelsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allRituels = this.rituels();
    if (!term || allRituels === undefined || allRituels.length === 0) {
      return allRituels || [];
    }
    return allRituels.filter(rituel =>
      rituel.nom.toLowerCase().includes(term)
    );
  });

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshRituels();
  }

  // --- Gestion de la recherche ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales ---
  openModal(rituel: Rituel) {
    this.selectedRituel = rituel;
    this.detailModal.open();
  }

  openUpdateModal(rituel: Rituel) {
    this.selectedRituel = rituel;
    this.updateModal.open();
  }

  openCreateModal() {
    this.selectedRituel = null;
    this.updateModal.open();
  }

  openDeleteModal(rituel: Rituel) {
    this.selectedRituel = rituel;
    setTimeout(() => {
      if (this.deleteModal) {
        this.deleteModal.open();
      }
    });
  }

  // --- Gestion CRUD ---
  refreshRituels() {
    this.rituelsService.getRituelsList().subscribe(rituels => {
      this.rituels.set(rituels);
    });
  }

  onRituelUpdated(updatedRituel: Rituel) {
    this.refreshRituels();
  }

  deleteRituel() {
    if (!this.selectedRituel) return;
    this.rituelsService.deleteRituel(this.selectedRituel.idRituel).subscribe(() => {
      this.refreshRituels();
      this.selectedRituel = null;
    });
  }

  // --- Utilitaires ---
  trackById(index: number, rituel: Rituel): number {
    return rituel.idRituel;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}
