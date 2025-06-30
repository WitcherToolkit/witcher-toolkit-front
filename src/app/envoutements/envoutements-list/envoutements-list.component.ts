import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { EnvoutementService } from '../envoutement.service';
import { DangerBorderDirective } from '../../directives/danger-border.directive';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { EnvoutementsDetailComponent } from '../envoutements-detail/envoutements-detail.component';
import { Envoutement } from '../../models/envoutement';

@Component({
  selector: 'app-envoutements-list',
  standalone: true,
  imports: [DangerBorderDirective, CommonModule, EnvoutementsDetailComponent],
  templateUrl: './envoutements-list.component.html',
  styleUrls: ['envoutements-list.component.scss']
})
export class EnvoutementsListComponent {
  private readonly envoutementService = inject(EnvoutementService);

  readonly MAX_LENGTH = 100;
  readonly searchTerm = signal('');
  readonly rituels = toSignal(this.envoutementService.getEnvoutementList(), { initialValue: [] });

  readonly envoutementsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allEnvoutements = this.rituels(); // Tous les envoutements chargés (c'est un signal !)
    if (!term || allEnvoutements === undefined || allEnvoutements.length === 0) { 
    return allEnvoutements || []; // Retourne tous les envoutements si le terme est vide ou si pas de données
    }
    return allEnvoutements.filter(envoutement =>
      envoutement.nom.toLowerCase().includes(term)
    );
  });

  trackById(index: number, envoutement: any): number {
    return envoutement.id;
  }

  truncate(text: string): string {
    return this.envoutementService.truncateText(text, this.MAX_LENGTH);
  }

  //#Region boite de rialogue
    @ViewChild(EnvoutementsDetailComponent) detailModal!: EnvoutementsDetailComponent;// Référence à la boîte de dialogue
    // Ajoute une propriété pour le rituel sélectionné
    selectedEnvoutement: Envoutement | null = null;
  
    // Modifie openModal pour recevoir le rituel
    openModal(envoutement: Envoutement) {
      this.selectedEnvoutement = envoutement;
      this.detailModal.open();
    }
    //#EndRegion boite de dialogue
}
