import { Component, computed, inject, signal } from '@angular/core';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { CommonModule } from '@angular/common';
import { RITUEL_LIST } from '../../fake-data-set/rituel-fake';
import { RituelsService } from '../rituels.service';

@Component({
  selector: 'app-rituels-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rituels-list.component.html',
  styles: ``
})
export class RituelsListComponent {
  readonly rituel = signal(RITUEL_LIST);
  readonly #rituelService = inject(RituelsService);
  readonly rituelsList = signal(this.#rituelService.getRituelList());
  readonly searchTerm = signal(''); // signal pour la recherche

  readonly rituelsListFiltered = computed(() => {
    const searchTerm = this.searchTerm();
    const rituelsList = this.rituelsList();
    // filtrage de la liste des compétences
    if (!searchTerm) return rituelsList;
    // sinon on retourne les sorts dont le nom contient le terme de recherche
    return rituelsList.filter(rituel => rituel.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  });

  trackById(index: number, rituel: any): number {
    return rituel.id;
  }}
