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
  readonly MAX_LENGTH = 100;// Nombre max de caractères avant troncature
  readonly envoutement = signal(ENVOUTEMENT_LIST);
  readonly #envoutementService = inject(EnvoutementService);
  readonly envoutementsList = signal(this.#envoutementService.getEnvoutementList());
  readonly searchTerm = signal(''); // signal pour la recherche

  readonly envoutementsListFiltered = computed(() => {
    const searchTerm = this.searchTerm();
    const envoutementsList = this.envoutementsList();
    // filtrage de la liste des compétences
    if (!searchTerm) return envoutementsList;
    // sinon on retourne les sorts dont le nom contient le terme de recherche
    return envoutementsList.filter(envoutement => envoutement.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  });

  trackById(index: number, envoutement: any): number {
    return envoutement.id;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }

}
