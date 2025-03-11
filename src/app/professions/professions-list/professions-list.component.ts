import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PROFESSION_LIST } from '../../fake-data-set/profession-fake';
import { ProfessionsService } from '../professions.service';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professions-list.component.html',
  styleUrl: './professions-list.component.scss'
})
export class ProfessionsListComponent {
  readonly profession = signal(PROFESSION_LIST);
  readonly #professionsService = inject(ProfessionsService);
  readonly professionsList = signal(this.#professionsService.getProfessionsList());
  readonly searchTerm = signal('');

  readonly professionsListFiltered = computed(() => {
      const searchTerm = this.searchTerm();
      const professionsList = this.professionsList();

      if (!searchTerm) return professionsList;

      return professionsList.filter(profession => profession.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  });

  particularitesNoms(profession: any): string {
      return profession.particularites.map((particularite: any) => particularite.nom).join(', ');
  }

  trackById(index: number, profession: any): number {
      return profession.id;
  }

}
