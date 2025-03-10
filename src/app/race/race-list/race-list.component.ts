import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RACE_LIST } from '../../fake-data-set/race-fake';
import { RaceService } from '../race.service';

@Component({
    selector: 'app-race-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './race-list.component.html',
    styleUrls: ['race-list.component.scss']
})
export class RaceListComponent {

    readonly races = signal(RACE_LIST);
    readonly #raceService = inject(RaceService);
    readonly racesList = signal(this.#raceService.getRacesList());
    readonly searchTerm = signal('');

    readonly racesListFiltered = computed(() => {
        const searchTerm = this.searchTerm();
        const racesList = this.racesList();

        if (!searchTerm) return racesList;

        return racesList.filter(race => race.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    });

    particularitesNoms(race: any): string {
        return race.particularites.map((particularite: any) => particularite.nom).join(', ');
    }

    trackById(index: number, race: any): number {
        return race.id;
    }
}