import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CaracteristiqueService } from '../caracteristique.service';
import { CaracteristiquesDetailComponent } from '../caracteristiques-detail/caracteristiques-detail.component';
import { Caracteristique } from '../../models/caracteristique';
import { SelectionBorderDirective } from '../../directives/selection-border.directive';
import { CaracteristiquesUpdateComponent } from '../caracteristiques-update/caracteristiques-update.component';

@Component({
  selector: 'app-caracteristiques-list',
  standalone: true,
  imports: [SelectionBorderDirective, CommonModule, CaracteristiquesDetailComponent, CaracteristiquesUpdateComponent],
  templateUrl: './caracteristiques-list.component.html',
  styleUrls: ['caracteristiques-list.component.scss']
})
export class CaracteristiquesListComponent {

  private readonly caracteristiqueService = inject(CaracteristiqueService);

  readonly MAX_LENGTH = 100;
  readonly caracteristiques = signal<Caracteristique[]>([]);

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

  //#region boite de rialogue
  @ViewChild(CaracteristiquesDetailComponent) detailModal!: CaracteristiquesDetailComponent;
  @ViewChild(CaracteristiquesUpdateComponent) updateModal!: CaracteristiquesUpdateComponent;
  
  // Ajoute une propriété pour la caracteristique sélectionnée
  selectedCaracteristique: Caracteristique | null = null;

  openModal(caracteristique: Caracteristique) {
    this.selectedCaracteristique = caracteristique;
    this.detailModal.open();
  }

  openUpdateModal(caracteristique: Caracteristique) {
      this.selectedCaracteristique = caracteristique;
      this.updateModal.open();
    }
  //#endRegion boite de dialogue

  //#region MAJ des Caracteristiques après une action
  ngOnInit() {
    this.refreshCaracteristiques();
  }


  // Ajoute une méthode pour rafraîchir la liste
  refreshCaracteristiques() {
    // Recharge la liste depuis le service
    this.caracteristiqueService.getCaracteristiquesList().subscribe(caracteristiques => {
      this.caracteristiques.set(caracteristiques);
    });
  }

  onCaracteristiqueUpdated(updatedCaracteristique: Caracteristique) {
    this.refreshCaracteristiques();
  }
  //#endRegion MAJ des caracteristiques après une action
}
