import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RituelsService } from '../rituels.service';
import { Rituel } from '../../models/rituel';
import { RituelsDetailComponent } from '../rituels-detail/rituels-detail.component';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { RituelsUpdateComponent } from '../rituels-update/rituels-update.component';

@Component({
  selector: 'app-rituels-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, RituelsDetailComponent, RituelsUpdateComponent],
  templateUrl: './rituels-list.component.html',
  styleUrl: './rituels-list.component.scss'
})
export class RituelsListComponent {

  private readonly rituelsService = inject(RituelsService);
 
  readonly rituels = signal<Rituel[]>([]);
  readonly searchTerm = signal('');

  readonly rituelsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase(); // Terme de recherche actuel
    const allRituels = this.rituels(); // Tous les rituels chargés (c'est un signal !)

    if (!term || allRituels === undefined || allRituels.length === 0) {
      return allRituels || []; // Retourne tous les rituels si le terme est vide ou si pas de données
    }

    return allRituels.filter(rituel =>
      rituel.nom.toLowerCase().includes(term)
    );
  });

  // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  trackById(index: number, rituel: Rituel): number {
    return rituel.idRituel;
  }

  //#Region boite de rialogue
  @ViewChild(RituelsDetailComponent) detailModal!: RituelsDetailComponent;// Référence à la boîte de dialogue
  @ViewChild(RituelsUpdateComponent) updateModal!: RituelsUpdateComponent;
  // Ajoute une propriété pour le rituel sélectionné
  selectedRituel: Rituel | null = null;

  // Modifie openModal pour recevoir le rituel
  openModal(rituel: Rituel) {
    this.selectedRituel = rituel;
    this.detailModal.open();
  }

  openUpdateModal(rituel: Rituel) {
    this.selectedRituel = rituel;
    this.updateModal.open();
  }
  //#endRegion boite de dialogue

  // #Region MAJ des rituels après une action
  ngOnInit() {
    this.refreshRituels();
  }


  // Ajoute une méthode pour rafraîchir la liste
  refreshRituels() {
    // Recharge la liste depuis le service
    this.rituelsService.getRituelsList().subscribe(rituels => {
      this.rituels.set(rituels);
    });
  }

  onRituelUpdated(updatedRituel: Rituel) {
    this.refreshRituels();
  }
  // #EndRegion MAJ des rituels après une action
  
}
