import { Component, computed, inject, signal } from '@angular/core';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { CommonModule } from '@angular/common';
import { RITUEL_LIST } from '../../fake-data-set/rituel-fake';
import { RituelsService } from '../rituels.service';
import { Rituel } from '../../models/rituel';

@Component({
  selector: 'app-rituels-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rituels-list.component.html',
  styles: ``
})
export class RituelsListComponent {
  private readonly rituelsService = inject(RituelsService);

  readonly searchTerm = signal('');

  readonly rituelsListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.rituelsService.searchRituels(term);
  });

  trackById(index: number, rituel: Rituel): number {
    return rituel.idRituel;
  }

  // Pour le futur (API) :
  // readonly rituelsList = toSignal(this.rituelsService.getRituelList());
}
