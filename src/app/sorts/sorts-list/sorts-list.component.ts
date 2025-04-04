import { Component, computed, inject, signal } from '@angular/core';
import { MAGIE_LIST } from '../../fake-data-set/magie-fake';
import { CommonModule } from '@angular/common';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { MagieService } from '../magie.service';

@Component({
  selector: 'app-sorts-list',
  standalone: true,
  imports: [NatureBorderDirective, CommonModule],
  templateUrl: './sorts-list.component.html',
  styles: ``
})
export class SortsListComponent {
  readonly MAX_LENGTH = 100;// Nombre max de caractères avant troncature
  readonly magie = signal(MAGIE_LIST);
  readonly #magieService = inject(MagieService);
  readonly magiesList = signal(this.#magieService.getMagieList());
  readonly searchTerm = signal(''); // signal pour la recherche

  readonly magiesListFiltered = computed(() => {
    const searchTerm = this.searchTerm();
    const magiesList = this.magiesList();
    // filtrage de la liste des compétences
    if (!searchTerm) return magiesList;
    // sinon on retourne les sorts dont le nom contient le terme de recherche
    return magiesList.filter(magie => magie.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  });

  trackById(index: number, magie: any): number {
    return magie.id;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}
