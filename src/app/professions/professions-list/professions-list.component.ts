import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { ProfessionsService } from '../professions.service';
import { Profession } from '../../models/profession';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { ProfessionsDetailComponent } from '../professions-detail/professions-detail.component';
import { ProfessionsUpdateComponent } from '../professions-update/professions-update.component';
import { PROFESSION_UPDATE_PATH } from '../../app-routing/app-routing-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, ProfessionsDetailComponent],
  templateUrl: './professions-list.component.html',
  styleUrl: './professions-list.component.scss'
})
export class ProfessionsListComponent {
  // Constantes
  readonly MAX_LENGTH = 150;

  // Service et signaux
  private readonly professionsService = inject(ProfessionsService);
  private router = inject(Router);

  readonly professionsUpdatePath = PROFESSION_UPDATE_PATH
  readonly professions = signal<Profession[]>([]);
  readonly searchTerm = signal('');

  // Filtrage de la liste selon le terme de recherche
  readonly professionsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase(); // Terme de recherche actuel
    const allProfessions = this.professions(); // Tous les professions chargés (c'est un signal !)

    if (!term || allProfessions === undefined || allProfessions.length === 0) {
      return allProfessions || []; // Retourne tous les professions si le terme est vide ou si pas de données
    }

    return allProfessions.filter(profession =>
      profession.nom.toLowerCase().includes(term)
    );
  });

  // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // Pour l'affichage optimisé dans *ngFor
  trackById(index: number, profession: Profession): number {
    return profession.idProfession || index; // Utilise idProfession si disponible, sinon index
  }

  // Tronque le texte si trop long
  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }

  //#region Gestion des modales (détail et édition)
  @ViewChild(ProfessionsDetailComponent) detailModal!: ProfessionsDetailComponent;
  @ViewChild(ProfessionsUpdateComponent) updateModal!: ProfessionsUpdateComponent;
  selectedProfession: Profession | null = null;

  // Ouvre la modale de détail
  openModal(profession: Profession) {
    // Assigner l'ID de la profession sélectionnée à selectedProfession
    this.selectedProfession = profession;
    this.detailModal.open();
  }


  // Ouvre la page d'édition
  goToUpdatePage(profession: Profession) {
    this.router.navigate([this.professionsUpdatePath, profession.idProfession]);
  }

  openCreatePage() {
    this.router.navigate([this.professionsUpdatePath]);
  }
  //#endregion

  //#region Cycle de vie et gestion de la liste
  // Initialisation du composant
  ngOnInit() {
    this.refreshProfessions();
  }

  // Rafraîchit la liste des professions depuis le service
  refreshProfessions() {
    this.professionsService.getProfessionsList().subscribe(professions => {
      this.professions.set(professions);
    });
  }
  //#endregion
}
