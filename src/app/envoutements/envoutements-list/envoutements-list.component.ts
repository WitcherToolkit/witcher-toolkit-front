import { Component, computed, inject, signal } from '@angular/core';
import { ENVOUTEMENT_LIST } from '../../fake-data-set/envoutement-fake';
import { EnvoutementService } from '../envoutement.service';
import { DangerBorderDirective } from '../../directives/danger-border.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-envoutements-list',
  standalone: true,
  imports: [DangerBorderDirective, CommonModule],
  templateUrl: './envoutements-list.component.html',
  styleUrls: ['envoutements-list.component.scss']
})
export class EnvoutementsListComponent {
  private readonly envoutementService = inject(EnvoutementService);

  readonly MAX_LENGTH = 100;

  readonly searchTerm = signal('');

  readonly envoutementsListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.envoutementService.searchEnvoutements(term);
  });

  trackById(index: number, envoutement: any): number {
    return envoutement.id;
  }

  truncate(text: string): string {
    return this.envoutementService.truncateText(text, this.MAX_LENGTH);
  }

  // Prévu pour le backend plus tard :
  // readonly envoutementsList = toSignal(this.envoutementService.getEnvoutementList());
}
