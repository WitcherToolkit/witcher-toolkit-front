import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PROFESSION_LIST } from '../../fake-data-set/profession-fake';
import { ProfessionsService } from '../professions.service';
import { Profession } from '../../models/profession';

@Component({
  selector: 'app-professions-list',
  standalone: true,
  imports: [CommonModule],
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

  // Pour le futur :
  // readonly professionsList = toSignal(this.professionsService.getProfessionsList());
}
