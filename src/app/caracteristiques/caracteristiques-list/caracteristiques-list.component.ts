import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CARACTERISTIQUE_LIST } from '../../fake-data-set/caracteristiques-fake';
import { CaracteristiqueService } from '../caracteristique.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-caracteristiques-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caracteristiques-list.component.html',
  styleUrls: ['caracteristiques-list.component.scss']
})
export class CaracteristiquesListComponent {

  private readonly caracteristiqueService = inject(CaracteristiqueService);

  readonly searchTerm = signal('');

  readonly caracteristiquesListFiltered = computed(() => {
    const term = this.searchTerm();
    return this.caracteristiqueService.searchCaracteristiques(term);
  });

  trackById(index: number, caracteristique: any): number {
    return caracteristique.id;
  }

  // Quand l'API sera branchée :
  // readonly caracteristiquesList = toSignal(this.caracteristiqueService.getCaracteristiquesList());
}
