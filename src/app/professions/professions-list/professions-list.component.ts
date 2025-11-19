import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { ProfessionsService } from '../professions.service';
import { Profession } from '../../models/profession';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { ProfessionsDetailComponent } from '../professions-detail/professions-detail.component';
import { ProfessionsUpdateComponent } from '../professions-update/professions-update.component';
import { PROFESSION_CREATE_PATH, PROFESSION_UPDATE_PATH } from '../../app-routing/app-routing-constants';
import { Router } from '@angular/router';
import { ConfirmDeleteModalComponentComponent } from '../../shared/confirm-delete-modal-component/confirm-delete-modal-component.component';
import { AuthService } from '../../shared/shared-services/auth.service';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [
    SelectionBorderDirective,
    CommonModule,
    ProfessionsDetailComponent,
    ConfirmDeleteModalComponentComponent
  ],
  templateUrl: './professions-list.component.html',
  styleUrl: './professions-list.component.scss'
})
export class ProfessionsListComponent {
  // --- Services et constantes ---
  private readonly professionsService = inject(ProfessionsService);
    readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly professionsUpdatePath = PROFESSION_UPDATE_PATH;
  readonly professionsCreatePath = PROFESSION_CREATE_PATH;
  readonly MAX_LENGTH = 150;

  // --- Services et propriétés réactives ---
  readonly professions = signal<Profession[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(ProfessionsDetailComponent) detailModal!: ProfessionsDetailComponent;
  @ViewChild(ProfessionsUpdateComponent) updateModal!: ProfessionsUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent;
  selectedProfession: Profession | null = null;
  professionToDelete: Profession | null = null;

  // --- Filtres et computed ---
  readonly professionsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allProfessions = this.professions();
    if (!term || allProfessions === undefined || allProfessions.length === 0) {
      return allProfessions || [];
    }
    return allProfessions.filter(profession =>
      profession.nom.toLowerCase().includes(term)
    );
  });

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshProfessions();
  }

  // --- Gestion de la recherche ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales et navigation ---
  openModal(profession: Profession) {
    this.selectedProfession = profession;
    this.detailModal.open();
  }

  openUpdatePage(profession: Profession) {
    this.router.navigate([this.professionsUpdatePath, profession.idProfession]);
  }

  openCreatePage() {
    this.router.navigate([this.professionsCreatePath]);
  }

  openDeleteModal(profession: Profession) {
      this.professionToDelete = profession;
      setTimeout(() => {
        if (this.deleteModal) {
          this.deleteModal.open();
        }
      });
    }

  // --- Gestion CRUD ---
  refreshProfessions() {
    this.professionsService.getProfessionsList().subscribe(professions => {
      this.professions.set(professions);
    });
  }

  deleteProfession() {
    if (!this.professionToDelete) return;
    this.professionsService.deleteProfession(this.professionToDelete.idProfession).subscribe(() => {
      this.refreshProfessions();
      this.professionToDelete = null;
    });
  }

  // --- Utilitaires ---
  trackById(index: number, profession: Profession): string {
  return profession.idProfession || index.toString();
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}
