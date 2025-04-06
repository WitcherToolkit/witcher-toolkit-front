import { Component, computed, inject, signal } from '@angular/core';
import { MAGIE_LIST } from '../../fake-data-set/magie-fake';
import { CommonModule } from '@angular/common';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { MagieService } from '../magie.service';
import { Magie } from '../../models/magie';

@Component({
  selector: 'app-sorts-list',
  standalone: true,
  imports: [NatureBorderDirective, CommonModule],
  templateUrl: './sorts-list.component.html',
  styles: ``
})
export class SortsListComponent {
  readonly MAX_LENGTH = 100; // Nombre max de caractères avant troncature

  private readonly magieService = inject(MagieService);

  readonly searchTerm = signal('');

  readonly magiesListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.magieService.searchMagies(term);
  });

  trackById(index: number, magie: Magie): number {
    return magie.idMagie;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}