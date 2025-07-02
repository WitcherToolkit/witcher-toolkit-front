import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RacesService } from '../races.service';
import { Race } from '../../models/race';
import { RacesDetailComponent } from '../races-detail/races-detail.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';

@Component({
    selector: 'app-races-list',
    standalone: true,
    imports: [SelectionBorderDirective, CommonModule, RacesDetailComponent],
    templateUrl: './races-list.component.html',
    styleUrls: ['races-list.component.scss']
})
export class RacesListComponent {
  private readonly racesService = inject(RacesService);
    
    readonly races = toSignal(this.racesService.getRacesList(), { initialValue: [] });
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
  
    // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
    onSearchChange(event: Event) {
      const inputElement = event.target as HTMLInputElement;
      this.searchTerm.set(inputElement.value);
    }
  
    trackById(index: number, race: Race): number {
      return race.idRace;
    }

    getParticularitesAsLine(race: Race): string {
      // Si race.particularites est un tableau d'objets avec un champ 'nom'
      return race.particulariteList?.map((p: any) => p.nom).join(', ') || '';
    }
  
    //#Region boite de rialogue
    @ViewChild(RacesDetailComponent) detailModal!: RacesDetailComponent;// Référence à la boîte de dialogue
    // Ajoute une propriété pour le race sélectionné
    selectedRace: Race | null = null;
  
    // Modifie openModal pour recevoir le race
    openModal(race: Race) {
      this.selectedRace = race;
      this.detailModal.open();
    }
    //#EndRegion boite de dialogue
  
}