import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RacesService } from '../races.service';
import { Race } from '../../models/race';
import { RacesDetailComponent } from '../races-detail/races-detail.component';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { RacesUpdateComponent } from '../races-update/races-update.component';
import { Router } from '@angular/router';
import { RACE_CREATE_PATH, RACE_UPDATE_PATH } from '../../app-routing/app-routing-constants';
import { ConfirmDeleteModalComponentComponent } from '../../shared-components/confirm-delete-modal-component/confirm-delete-modal-component.component';

@Component({
    selector: 'app-races-list',
    standalone: true,
    imports: [
      SelectionBorderDirective,
      CommonModule,
      RacesDetailComponent,
      ConfirmDeleteModalComponentComponent
    ],
    templateUrl: './races-list.component.html',
    styleUrls: ['races-list.component.scss']
})
export class RacesListComponent {
  // --- Services et constantes ---
  private readonly racesService = inject(RacesService);
  private router = inject(Router);
  readonly raceUpdatePath = RACE_UPDATE_PATH;
  readonly raceCreatePath = RACE_CREATE_PATH;
  readonly MAX_LENGTH = 100;

  // --- Signaux et propriétés réactives ---
  readonly races = signal<Race[]>([]);
  readonly searchTerm = signal('');

  // --- Propriétés pour la gestion des modales ---
  @ViewChild(RacesDetailComponent) detailModal!: RacesDetailComponent;
  @ViewChild(RacesUpdateComponent) updateModal!: RacesUpdateComponent;
  @ViewChild('deleteModal') deleteModal!: ConfirmDeleteModalComponentComponent;
  selectedRace: Race | null = null;
  raceToDelete: Race | null = null;

  // --- Filtres et computed ---
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

  // --- Cycle de vie ---
  ngOnInit() {
    this.refreshRaces();
  }

  // --- Gestion de la recherche ---
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  // --- Gestion des modales et navigation ---
  openModal(race: Race) {
    this.selectedRace = race;
    this.detailModal.open();
  }

  openUpdatePage(race: Race) {
    this.router.navigate([this.raceUpdatePath, race.idRace]);
  }

  openCreatePage() {
    this.router.navigate([this.raceCreatePath]);
  }

  openDeleteModal(race: Race) {
    this.raceToDelete = race;
    setTimeout(() => {
      if (this.deleteModal) {
        this.deleteModal.open();
      }
    });
  }

  // --- Gestion CRUD ---
  refreshRaces() {
    this.racesService.getRacesList().subscribe(races => {
      this.races.set(races);
    });
  }

  deleteRace() {
    if (!this.raceToDelete) return;
    this.racesService.deleteRace(this.raceToDelete.idRace).subscribe(() => {
      this.refreshRaces();
      this.raceToDelete = null;
    });
  }

  // --- Utilitaires pour l'affichage ---
  trackById(index: number, race: Race): number {
    return race.idRace;
  }

  getParticularitesAsLine(race: Race): string {
    return race.particulariteList?.map((p: any) => p.nom).join(', ') || '';
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }
}