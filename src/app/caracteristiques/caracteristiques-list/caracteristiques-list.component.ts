import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CARACTERISTIQUE_LIST } from '../../fake-data-set/caracteristiques-fake';
import { CaracteristiqueService } from '../caracteristique.service';

@Component({
  selector: 'app-caracteristiques-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caracteristiques-list.component.html',
  styleUrls: ['caracteristiques-list.component.scss']
})
export class CaracteristiquesListComponent {
  readonly caracteristique = signal(CARACTERISTIQUE_LIST);
  readonly #caracteristiqueService = inject(CaracteristiqueService);
  readonly caracteristiquesList = signal(this.#caracteristiqueService.getCaracteristiquesList());
  readonly searchTerm = signal(''); // signal pour la recherche

  readonly caracteristiquesListFiltered = computed(() => {
    const searchTerm = this.searchTerm();
    const caracteristiquesList = this.caracteristiquesList();
    // filtrage de la liste des compétences
    if (!searchTerm) return caracteristiquesList;
    // sinon on retourne les compétences dont le nom contient le terme de recherche
    return caracteristiquesList.filter(caracteristique => caracteristique.nom.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  });

  trackById(index: number, caracteristique: any): number {
    return caracteristique.id;
  }

}
