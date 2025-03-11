import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RACE_LIST } from '../../fake-data-set/race-fake';
import { RacesService } from '../races.service';

@Component({
    selector: 'app-races-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './races-list.component.html',
    styleUrls: ['races-list.component.scss']
})
export class RacesListComponent {

    readonly race = signal(RACE_LIST);
    readonly #racesService = inject(RacesService);
    readonly racesList = signal(this.#racesService.getRacesList());
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