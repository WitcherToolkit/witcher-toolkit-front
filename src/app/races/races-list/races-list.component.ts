import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RACE_LIST } from '../../fake-data-set/race-fake';
import { RacesService } from '../races.service';
import { RouterLink } from '@angular/router';
import { RACE_BASE_PATH } from '../../app-routing/app.routes';
import { Race } from '../../models/race';

@Component({
    selector: 'app-races-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './races-list.component.html',
    styleUrls: ['races-list.component.scss']
})
export class RacesListComponent {
    readonly raceBasePath = RACE_BASE_PATH;

  private readonly racesService = inject(RacesService);

  readonly searchTerm = signal('');

  readonly racesListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.racesService.searchRaces(term);
  });

  particularitesNoms(race: Race): string {
    return this.racesService.getParticularitesNoms(race);
  }

  trackById(index: number, race: Race): number {
    return race.idRace;
  }

  // Pour plus tard :
  // readonly racesList = toSignal(this.racesService.getRacesList());
}