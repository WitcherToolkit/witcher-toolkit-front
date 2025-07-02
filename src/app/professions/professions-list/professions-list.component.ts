import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { PROFESSION_LIST } from '../../fake-data-set/profession-fake';
import { ProfessionsService } from '../professions.service';
import { Profession } from '../../models/profession';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { ProfessionsDetailComponent } from '../professions-detail/professions-detail.component';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, ProfessionsDetailComponent],
  templateUrl: './professions-list.component.html',
  styleUrl: './professions-list.component.scss'
})
export class ProfessionsListComponent {
  private readonly professionsService = inject(ProfessionsService);

  readonly searchTerm = signal('');

  readonly professionsListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.professionsService.searchProfessions(term);
  });

  trackById(index: number, profession: Profession): number {
    return profession.id;
  }

  //#Region boite de rialogue
  @ViewChild(ProfessionsDetailComponent) detailModal!: ProfessionsDetailComponent;
  // Ajoute une propriété pour le race sélectionné
  selectedProfession: Profession | null = null;

  // Modifie openModal pour recevoir le race
  openModal(profession: Profession) {
    this.selectedProfession = profession;
    this.detailModal.open();
  }
  //#EndRegion boite de dialogue

}
