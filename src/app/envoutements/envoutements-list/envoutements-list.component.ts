import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { EnvoutementService } from '../envoutement.service';
import { DangerBorderDirective } from '../../directives/danger-border.directive';
import { CommonModule } from '@angular/common';
import { EnvoutementsDetailComponent } from '../envoutements-detail/envoutements-detail.component';
import { Envoutement } from '../../models/envoutement';
import { EnvoutementsUpdateComponent } from '../envoutements-update/envoutements-update.component';

@Component({
  selector: 'app-envoutements-list',
  standalone: true,
  imports: [DangerBorderDirective, CommonModule, EnvoutementsDetailComponent, EnvoutementsUpdateComponent],
  templateUrl: './envoutements-list.component.html',
  styleUrls: ['envoutements-list.component.scss']
})
export class EnvoutementsListComponent implements OnInit {
  private readonly envoutementService = inject(EnvoutementService);

  readonly MAX_LENGTH = 100;
  envoutements = signal<Envoutement[]>([]);

  readonly searchTerm = signal('');
  //readonly envoutements = toSignal(this.envoutementService.getEnvoutementList(), { initialValue: [] });

  readonly envoutementsListFiltered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const allEnvoutements = this.envoutements(); // Tous les envoutements chargés (c'est un signal !)
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

  truncateText(text: string): string {
    if (text.length > this.MAX_LENGTH) {
      return text.substring(0, this.MAX_LENGTH) + '...';
    }
    return text;
  }

  //#region boite de rialogue
    @ViewChild(EnvoutementsDetailComponent) detailModal!: EnvoutementsDetailComponent;// Référence à la boîte de dialogue
    @ViewChild(EnvoutementsUpdateComponent) updateModal!: EnvoutementsUpdateComponent;
    
    // Ajoute une propriété pour le envoutement sélectionné
    selectedEnvoutement: Envoutement | null = null;
  
    // Modifie openModal pour recevoir le envoutement
    openModal(envoutement: Envoutement) {
      this.selectedEnvoutement = envoutement;
      this.detailModal.open();
    }

    openUpdateModal(envoutement: Envoutement) {
      this.selectedEnvoutement = envoutement;
      this.updateModal.open();
    }

    openCreateModal() {
      this.selectedEnvoutement = null;
      this.updateModal.open();
    }
    //#endRegion boite de dialogue
  
    //#region MAJ des Envoutements après une action
    ngOnInit() {
      this.refreshEnvoutements();
    }
  
  
    // Ajoute une méthode pour rafraîchir la liste
    refreshEnvoutements() {
      // Recharge la liste depuis le service
      this.envoutementService.getEnvoutementList().subscribe(envoutements => {
        this.envoutements.set(envoutements);
      });
    }
  
    onEnvoutementUpdated(updatedEnvoutement: Envoutement) {
      this.refreshEnvoutements();
    }
    //#endRegion MAJ des envoutements après une action
}
