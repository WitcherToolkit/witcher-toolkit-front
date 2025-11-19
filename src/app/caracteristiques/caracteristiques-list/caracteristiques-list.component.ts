import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CaracteristiqueService } from '../caracteristique.service';
import { CaracteristiquesDetailComponent } from '../caracteristiques-detail/caracteristiques-detail.component';
import { Caracteristique } from '../../models/caracteristique';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { CaracteristiquesUpdateComponent } from '../caracteristiques-update/caracteristiques-update.component';
import { ConfirmDeleteModalComponentComponent } from '../../shared/confirm-delete-modal-component/confirm-delete-modal-component.component';
import { AuthService } from '../../shared/shared-services/auth.service';

@Component({
  selector: 'app-caracteristiques-list',
  standalone: true,
  imports: [
    SelectionBorderDirective,
    CommonModule,
    CaracteristiquesDetailComponent,
    CaracteristiquesUpdateComponent,
    ConfirmDeleteModalComponentComponent
  ],
  templateUrl: './caracteristiques-list.component.html',
  styleUrls: ['caracteristiques-list.component.scss']
})
export class CaracteristiquesListComponent {
  // --- Services et constantes ---
  private readonly caracteristiqueService = inject(CaracteristiqueService);
    readonly auth = inject(AuthService);
  readonly MAX_LENGTH = 100;

  // --- Signaux et propriétés réactives ---
  readonly caracteristiques = signal<Caracteristique[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(CaracteristiquesDetailComponent) detailModal!: CaracteristiquesDetailComponent;
  @ViewChild(CaracteristiquesUpdateComponent) updateModal!: CaracteristiquesUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent;
  selectedCaracteristique: Caracteristique | null = null; // Pour détail/édition
  caracteristiqueToDelete: Caracteristique | null = null; // Pour suppression

  // --- Filtres et computed ---
  readonly caracteristiquesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allCaracteristiques = this.caracteristiques();
    if (!term || allCaracteristiques === undefined || allCaracteristiques.length === 0) {
      return allCaracteristiques || [];
    }
    return allCaracteristiques.filter(caracteristique =>
      caracteristique.nom.toLowerCase().includes(term)
    );
  });

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshCaracteristiques();
  }

  // --- Gestion de la recherche ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales ---
  openModal(caracteristique: Caracteristique) {
    this.selectedCaracteristique = caracteristique;
    this.detailModal.open();
  }

  openUpdateModal(caracteristique: Caracteristique) {
    this.selectedCaracteristique = caracteristique;
    this.updateModal.open();
  }

  openCreateModal() {
    this.selectedCaracteristique = null;
    this.updateModal.open();
  }

  openDeleteModal(caracteristique: Caracteristique) {
    this.caracteristiqueToDelete = caracteristique;
    setTimeout(() => {
      if (this.deleteModal) {
        this.deleteModal.open();
      }
    });
  }

  // --- Gestion CRUD ---
  refreshCaracteristiques() {
    this.caracteristiqueService.getCaracteristiquesList().subscribe(caracteristiques => {
      this.caracteristiques.set(caracteristiques);
    });
  }

  onCaracteristiqueUpdated(updatedCaracteristique: Caracteristique) {
    this.refreshCaracteristiques();
  }

  deleteCaracteristique() {
    if (!this.caracteristiqueToDelete) return;
    this.caracteristiqueService.deleteCaracteristique(this.caracteristiqueToDelete.idCaracteristique).subscribe(() => {
      this.refreshCaracteristiques();
      this.caracteristiqueToDelete = null;
    });
  }

  // --- Utilitaires ---
  trackById(index: number, caracteristique: Caracteristique): string {
    return caracteristique.idCaracteristique || index.toString();
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}
