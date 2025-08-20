import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RacesService } from '../races.service';
import { Race } from '../../models/race';
import { RacesDetailComponent } from '../races-detail/races-detail.component';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { RacesUpdateComponent } from '../races-update/races-update.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-races-list',
    standalone: true,
    imports: [SelectionBorderDirective, CommonModule, RacesDetailComponent],
    templateUrl: './races-list.component.html',
    styleUrls: ['races-list.component.scss']
})
export class RacesListComponent {
  // Service et signaux
  private readonly racesService = inject(RacesService);
  readonly races = signal<Race[]>([]);
  readonly searchTerm = signal('');

  private router = inject(Router);

  // Filtrage de la liste selon le terme de recherche
  readonly racesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allRaces = this.races();
    if (!term || allRaces === undefined || allRaces.length === 0) {
      return allRaces || [];
    }
    return allRaces.filter(race =>
      race.nom.toLowerCase().includes(term)
    );
  });

  // Pour l'affichage optimisé dans *ngFor
  trackById(index: number, race: Race): number {
    return race.idRace;
  }

  // Affiche les particularités sous forme de ligne
  getParticularitesAsLine(race: Race): string {
    return race.particulariteList?.map((p: any) => p.nom).join(', ') || '';
  }

  //#region Gestion des modales (détail et édition)
  @ViewChild(RacesDetailComponent) detailModal!: RacesDetailComponent;
  @ViewChild(RacesUpdateComponent) updateModal!: RacesUpdateComponent;
  selectedRace: Race | null = null;

  // Ouvre la modale de détail
  openModal(race: Race) {
    this.selectedRace = race;
    this.detailModal.open();
  }

  // Ouvre la modale d'édition
  goToUpdatePage(race: Race) {
    this.router.navigate(['/classe/race/update', race.idRace]);
  }

  openCreatePage() {
    this.router.navigate(['/classe/race/create']);
  }
  //#endregion

  //#region Cycle de vie et gestion de la liste
  // Initialisation du composant
  ngOnInit() {
    this.refreshRaces();
  }

  // Rafraîchit la liste des races depuis le service
  refreshRaces() {
    this.racesService.getRacesList().subscribe(races => {
      this.races.set(races);
    });
  }

  // Callback après modification d'une race
  onRaceUpdated(updatedRace: Race) {
    this.refreshRaces();
  }
  //#endregion
}