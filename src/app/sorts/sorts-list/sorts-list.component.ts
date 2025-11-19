// Composant listant les sorts/magies
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { MagieService } from '../magie.service';
import { Magie } from '../../models/magie';
import { SortsDetailComponent } from '../sorts-detail/sorts-detail.component';
import { SortsUpdateComponent } from '../sorts-update/sorts-update.component';
import { ConfirmDeleteModalComponentComponent } from '../../shared/confirm-delete-modal-component/confirm-delete-modal-component.component';
import { AuthService } from '../../shared/shared-services/auth.service';

@Component({
  selector: 'app-sorts-list',
  standalone: true,
  imports: [
    NatureBorderDirective,
    CommonModule,
    SortsDetailComponent,
    SortsUpdateComponent,
    ConfirmDeleteModalComponentComponent
  ],
  templateUrl: './sorts-list.component.html',
  styleUrls: ['./sorts-list.component.scss']
})
export class SortsListComponent implements OnInit {
  // --- Services et constantes ---
  private readonly magieService = inject(MagieService);
  readonly auth = inject(AuthService);
  readonly MAX_LENGTH = 100; // Nombre max de caractères avant troncature

  // --- Signaux et propriétés réactives ---
  magie = signal<Magie[]>([]); // Liste des magies
  readonly searchTerm = signal(''); // Terme de recherche
  readonly selectedType = signal('Tout les types'); // Filtre par type

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(SortsDetailComponent) detailModal!: SortsDetailComponent;
  @ViewChild(SortsUpdateComponent) updateModal!: SortsUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent; //Autre méthode pour faire appel à la modal
  selectedMagie: Magie | null = null; // Pour détail/édition
  magieToDelete: Magie | null = null; // Pour suppression

  // --- Filtres et computed ---
  readonly magiesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const selectedType = this.selectedType();
    let allMagies = this.magie();
    if (!allMagies) return [];
    if (selectedType !== 'Tout les types') {
      allMagies = allMagies.filter(magie => magie.type === selectedType);
    }
    if (term) {
      allMagies = allMagies.filter(magie =>
        magie.nom.toLowerCase().includes(term)
      );
    }
    return allMagies;
  });

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshMagies();
  }

  // --- Gestion de la recherche et des filtres ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales ---
  openModal(magie: Magie) {
    this.selectedMagie = magie;
    this.detailModal.open();
  }

  openUpdateModal(magie: Magie) {
    this.selectedMagie = magie;
    this.updateModal.open();
  }

  openCreateModal() {
    this.selectedMagie = null;
    this.updateModal.open();
  }

  openDeleteModal(magie: Magie) {
    this.magieToDelete = magie;
    setTimeout(() => {
      if (this.deleteModal) {
        this.deleteModal.open();
      }
    });
  }

  // --- Gestion CRUD ---
  refreshMagies() {
    this.magieService.getMagiesList().subscribe(magies => {
      this.magie.set(magies);
    });
  }

  onMagieUpdated(updatedMagie: Magie) {
    this.refreshMagies();
  }

  deleteMagie() {
    if (!this.magieToDelete) return;
    this.magieService.deleteMagie(this.magieToDelete.idMagie).subscribe(() => {
      this.refreshMagies();
      this.magieToDelete = null;
    });
  }

  // --- Utilitaires ---
  trackById(index: number, magie: Magie): string {
    return magie.idMagie || index.toString();
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}