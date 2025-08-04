import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { PROFESSION_LIST } from '../../fake-data-set/profession-fake';
import { ProfessionsService } from '../professions.service';
import { Profession } from '../../models/profession';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { ProfessionsDetailComponent } from '../professions-detail/professions-detail.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, ProfessionsDetailComponent],
  templateUrl: './professions-list.component.html',
  styleUrl: './professions-list.component.scss'
})
export class ProfessionsListComponent {
  private readonly professionsService = inject(ProfessionsService);
  readonly MAX_LENGTH = 150;

  readonly professions = toSignal(this.professionsService.getProfessionsList(), { initialValue: [] });
  readonly searchTerm = signal('');

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

  trackById(index: number, profession: Profession): number {
    return profession.idProfession || index; // Utilisez idProfession si disponible, sinon indexez
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }

  //#region boite de rialogue
  @ViewChild(ProfessionsDetailComponent) detailModal!: ProfessionsDetailComponent;
  // Ajoute une propriété pour le race sélectionné
  selectedProfessionId: number | null = null;

  // Modifie openModal pour recevoir le race
  openModal(profession: Profession) {
    // Assigner l'ID de la profession sélectionnée à selectedProfessionId
    this.selectedProfessionId = profession.idProfession || null;

    this.detailModal.open();
  }
  //#endRegion boite de dialogue

}
