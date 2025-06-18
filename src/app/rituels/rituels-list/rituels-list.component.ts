import { AfterViewInit, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RituelsService } from '../rituels.service';
import { Rituel } from '../../models/rituel';
import { toSignal } from '@angular/core/rxjs-interop';
import { RituelsDetailComponent } from '../rituels-detail/rituels-detail.component';

@Component({
  selector: 'app-rituels-list',
  standalone: true,
  imports: [CommonModule, RituelsDetailComponent],
  templateUrl: './rituels-list.component.html',
  styles: ``
})
export class RituelsListComponent {
  private readonly rituelsService = inject(RituelsService);
  
  readonly rituels = toSignal(this.rituelsService.getRituelsList(), { initialValue: [] });
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
    return rituel.idRituel; // Assurez-vous que 'idRituel' est la bonne propriété d'ID
  }

  //#Region boite de rialogue
  @ViewChild(RituelsDetailComponent) detailModal!: RituelsDetailComponent;// Référence à la boîte de dialogue
  // Ajoute une propriété pour le rituel sélectionné
  selectedRituel: Rituel | null = null;

  // Modifie openModal pour recevoir le rituel
  openModal(rituel: Rituel) {
    this.selectedRituel = rituel;
    this.detailModal.open();
  }
  //#EndRegion boite de dialogue
}
