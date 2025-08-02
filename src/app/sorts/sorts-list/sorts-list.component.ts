import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NatureBorderDirective } from '../../directives/nature-border.directive';
import { MagieService } from '../magie.service';
import { Magie } from '../../models/magie';
import { SortsDetailComponent } from '../sorts-detail/sorts-detail.component';
import { SortsUpdateComponent } from '../sorts-update/sorts-update.component';

@Component({
  selector: 'app-sorts-list',
  standalone: true,
  imports: [NatureBorderDirective, CommonModule, SortsDetailComponent, SortsUpdateComponent],
  templateUrl: './sorts-list.component.html',
  styles: ``
})
export class SortsListComponent implements OnInit {
  private readonly magieService = inject(MagieService);

  readonly MAX_LENGTH = 100; // Nombre max de caractères avant troncature
  magie = signal<Magie[]>([]);
  
  readonly searchTerm = signal('');
  readonly selectedType = signal('Tout les types'); // Par defaut, aucun filtre ur le type

   readonly magiesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const selectedType = this.selectedType();
    let allMagies = this.magie();

    if (allMagies === undefined) {
      return [];
    }

    // Filtrer par type si un type spécifique est sélectionné
    if (selectedType !== 'Tout les types') {
      allMagies = allMagies.filter(magie => magie.type === selectedType);
    }

    // Filtrer par terme de recherche
    if (term) {
      allMagies = allMagies.filter(magie =>
        magie.nom.toLowerCase().includes(term)
      );
    }

    return allMagies;
  });

  // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  trackById(index: number, magie: Magie): number {
    return magie.idMagie;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }

  //#region boite de dialogue
  @ViewChild(SortsDetailComponent) detailModal!: SortsDetailComponent;// Référence à la boîte de dialogue
  @ViewChild(SortsUpdateComponent) updateModal!: SortsUpdateComponent;
  
  // Ajoute une propriété pour le rituel sélectionné
  selectedMagie: Magie | null = null;

  // Modifie openModal pour recevoir le rituel
  openModal(magie: Magie) {
    this.selectedMagie = magie;
    this.detailModal.open();
  }

  openUpdateModal(magie: Magie) {
    this.selectedMagie = magie;
    this.updateModal.open();
  }
  //#endRegion boite de dialogue

  // #Region MAJ des magies après une action
  ngOnInit() {
    this.refreshMagies();
  }


  // Ajoute une méthode pour rafraîchir la liste
  refreshMagies() {
    // Recharge la liste depuis le service
    this.magieService.getMagiesList().subscribe(magies => {
      this.magie.set(magies);
    });
  }

  onMagieUpdated(updatedMagie: Magie) {
    this.refreshMagies();
  }
  // #EndRegion MAJ des magies après une action

}