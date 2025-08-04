import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RacesService } from '../races.service';
import { Race } from '../../models/race';
import { RacesDetailComponent } from '../races-detail/races-detail.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { RacesUpdateComponent } from '../races-update/races-update.component';

@Component({
    selector: 'app-races-list',
    standalone: true,
    imports: [SelectionBorderDirective, CommonModule, RacesDetailComponent, RacesUpdateComponent],
    templateUrl: './races-list.component.html',
    styleUrls: ['races-list.component.scss']
})
export class RacesListComponent {
  private readonly racesService = inject(RacesService);
    
  readonly races = signal<Race[]>([]);

  readonly searchTerm = signal('');

  readonly racesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase(); // Terme de recherche actuel
    const allRaces = this.races(); // Tous les races chargés (c'est un signal !)

    if (!term || allRaces === undefined || allRaces.length === 0) {
      return allRaces || []; // Retourne tous les races si le terme est vide ou si pas de données
    }

    return allRaces.filter(race =>
      race.nom.toLowerCase().includes(term)
    );
  });
  
  trackById(index: number, race: Race): number {
    return race.idRace;
  }

  getParticularitesAsLine(race: Race): string {
    // Si race.particularites est un tableau d'objets avec un champ 'nom'
    return race.particulariteList?.map((p: any) => p.nom).join(', ') || '';
  }
  
  //#region boite de rialogue
  @ViewChild(RacesDetailComponent) detailModal!: RacesDetailComponent;
  @ViewChild(RacesUpdateComponent) updateModal!: RacesUpdateComponent;

  // Ajoute une propriété pour le race sélectionné
  selectedRace: Race | null = null;

  // Modifie openModal pour recevoir le race
  openModal(race: Race) {
    this.selectedRace = race;
    this.detailModal.open();
  }

  openUpdateModal(race: Race) {
        this.selectedRace = race;
        this.updateModal.open();
      }
  //#endregion boite de dialogue

  //#region MAJ des races après une action
    ngOnInit() {
      this.refreshRaces();
    }
  
  // Ajoute une méthode pour rafraîchir la liste
  refreshRaces() {
    // Recharge la liste depuis le service
    this.racesService.getRacesList().subscribe(races => {
      this.races.set(races);
    });
  }

  onRaceUpdated(updatedRace: Race) {
    this.refreshRaces();
  }
  // #endregion MAJ des races après une action
  
}