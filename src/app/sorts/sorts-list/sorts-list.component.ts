import { Component, computed, inject, signal } from '@angular/core';
import { MAGIE_LIST } from '../../fake-data-set/magie-fake';
import { CommonModule } from '@angular/common';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { MagieService } from '../magie.service';
import { Magie } from '../../models/magie';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sorts-list',
  standalone: true,
  imports: [NatureBorderDirective, CommonModule],
  templateUrl: './sorts-list.component.html',
  styles: ``
})
export class SortsListComponent {
  private readonly magieService = inject(MagieService);

  readonly MAX_LENGTH = 100; // Nombre max de caractères avant troncature
  readonly magie = toSignal(this.magieService.getMagiesList(), { initialValue: [] });
  readonly searchTerm = signal('');

  readonly magiesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allMagies = this.magie(); // Tous les sorts chargés (c'est un signal !)
    if (!term || allMagies === undefined || allMagies.length === 0) {
      return allMagies || []; // Retourne tous les sorts si le terme est vide ou si pas de données
    }
    return allMagies.filter(magie =>
      magie.nom.toLowerCase().includes(term)
    );
  });

  // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

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