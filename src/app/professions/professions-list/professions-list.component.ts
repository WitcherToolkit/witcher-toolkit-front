import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { ProfessionsService } from '../professions.service';
import { Profession } from '../../models/profession';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { ProfessionsDetailComponent } from '../professions-detail/professions-detail.component';
import { ProfessionsUpdateComponent } from '../professions-update/professions-update.component';
import { PROFESSION_CREATE_PATH, PROFESSION_UPDATE_PATH } from '../../app-routing/app-routing-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, ProfessionsDetailComponent],
  templateUrl: './professions-list.component.html',
  styleUrl: './professions-list.component.scss'
})
export class ProfessionsListComponent {
  // --- Constantes ---
  readonly MAX_LENGTH = 150;
  readonly professionsUpdatePath = PROFESSION_UPDATE_PATH;
  readonly professionsCreatePath = PROFESSION_CREATE_PATH;

  // --- Services et signaux ---
  private readonly professionsService = inject(ProfessionsService);
  private readonly router = inject(Router);
  readonly professions = signal<Profession[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(ProfessionsDetailComponent) detailModal!: ProfessionsDetailComponent;
  @ViewChild(ProfessionsUpdateComponent) updateModal!: ProfessionsUpdateComponent;
  selectedProfession: Profession | null = null;

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

  goToUpdatePage(profession: Profession) {
    this.router.navigate([this.professionsUpdatePath, profession.idProfession]);
  }

  openCreatePage() {
    this.router.navigate([this.professionsCreatePath]);
  }

  // --- Gestion CRUD ---
  refreshProfessions() {
    this.professionsService.getProfessionsList().subscribe(professions => {
      this.professions.set(professions);
    });
  }

  // --- Utilitaires ---
  trackById(index: number, profession: Profession): number {
    return profession.idProfession || index;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}
