import { Component, computed, inject, signal } from '@angular/core';
import { ENVOUTEMENT_LIST } from '../../fake-data-set/envoutement-fake';
import { EnvoutementService } from '../envoutement.service';
import { DangerBorderDirective } from '../../directives/danger-border.directive';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

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
  readonly rituels = toSignal(this.envoutementService.getEnvoutementList(), { initialValue: [] });

  readonly envoutementsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allEnvoutements = this.rituels(); // Tous les envoutements chargés (c'est un signal !)
    if (!term || allEnvoutements === undefined || allEnvoutements.length === 0) { 
    return allEnvoutements || []; // Retourne tous les envoutements si le terme est vide ou si pas de données
    }
    return allEnvoutements.filter(envoutement =>
      envoutement.nom.toLowerCase().includes(term)
    );
  });

  trackById(index: number, envoutement: any): number {
    return envoutement.id;
  }

  truncate(text: string): string {
    return this.envoutementService.truncateText(text, this.MAX_LENGTH);
  }

}
