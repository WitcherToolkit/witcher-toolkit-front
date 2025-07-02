import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CARACTERISTIQUE_LIST } from '../../fake-data-set/caracteristiques-fake';
import { CaracteristiqueService } from '../caracteristique.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CaracteristiquesDetailComponent } from '../caracteristiques-detail/caracteristiques-detail.component';
import { Caracteristique } from '../../models/caracteristique';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';

@Component({
  selector: 'app-caracteristiques-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, CaracteristiquesDetailComponent],
  templateUrl: './caracteristiques-list.component.html',
  styleUrls: ['caracteristiques-list.component.scss']
})
export class CaracteristiquesListComponent {

  private readonly caracteristiqueService = inject(CaracteristiqueService);

  readonly MAX_LENGTH = 100;
  readonly caracteristiques = toSignal(this.caracteristiqueService.getCaracteristiquesList(), { initialValue: [] });
  readonly searchTerm = signal('');

  readonly caracteristiquesListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allCaracteristiques = this.caracteristiques();

    if (!term || allCaracteristiques === undefined || allCaracteristiques.length === 0) {
      return allCaracteristiques || [];
    }

    return allCaracteristiques.filter(caracteristique =>
      caracteristique.nom.toLowerCase().includes(term)
    );
  });

  // Méthode pour mettre à jour le searchTerm (peut être liée à un événement input)
  onSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }

  trackById(index: number, caracteristique: any): number {
    return caracteristique.idCaracteristique;
  }

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }

  //#Region boite de rialogue
  @ViewChild(CaracteristiquesDetailComponent) detailModal!: CaracteristiquesDetailComponent;// Référence à la boîte de dialogue
  // Ajoute une propriété pour le rituel sélectionné
  selectedCaracteristique: Caracteristique | null = null;

  // Modifie openModal pour recevoir le rituel
  openModal(caracteristique: Caracteristique) {
    this.selectedCaracteristique = caracteristique;
    this.detailModal.open();
  }
  //#EndRegion boite de dialogue

}
