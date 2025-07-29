import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { Profession } from '../../models/profession';
import { CompetenceProfession } from '../../models/competence-profession';
import { error } from 'jquery';
import { ProfessionsService } from '../professions.service';

@Component({
  selector: 'app-professions-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professions-detail.component.html'
})
export class ProfessionsDetailComponent implements AfterViewInit {

 // Use a setter for the input to react to changes and fetch data
  @Input() set professionId(id: number | null) {
    if (id !== null) {
      this.fetchProfessionDetails(id);
    } else {
      this.detailedProfession.set(null); // Clear previous details if no ID is provided
    }
  }

  @ViewChild('modal') modalRef!: ElementRef;

  private readonly professionsService = inject(ProfessionsService);
  readonly detailedProfession = signal<Profession | null>(null); // Signal pour conserver les données détaillées sur la profession
  constructor() {}

  get inventaireNormaux() {
    return this.detailedProfession()?.inventaireWikiList?.filter(i => !i.special) || [];
  }

  get inventaireSpeciaux() {
    return this.detailedProfession()?.inventaireWikiList?.filter(i => i.special === true) || [];
  }

  ngAfterViewInit() {
    // Initialize Materialize modal after the view has been initialized
    if (this.modalRef && M && M.Modal) {
      M.Modal.init(this.modalRef.nativeElement);
    }
  }

  // Méthode pour récupérer les détails de la profession à partir du service
  fetchProfessionDetails(id: number) {
    this.professionsService.getProfessionCompetences(id).subscribe({
      next: (data: Profession) => {
        this.detailedProfession.set(data); // Mettre à jour le signal avec les données récupérées
      },
      error: (err) => {
        console.error('Error fetching profession details:', err);
        this.detailedProfession.set(null); // Effacer les données en cas d'erreur
        // En option, afficher un message d'erreur à l'utilisateur
      }
    });
  }

  // Méthode pour ouvrir la fenêtre modale Materialize
  open() {
    if (this.modalRef && M && M.Modal) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      if (instance) {
        instance.open();
      }
    }
  }

  // Aide à l'accès aux compétences du modèle en toute sécurité
  get competences(): CompetenceProfession[] {
    return this.detailedProfession()?.competenceList || [];
  }

  // Fonction TrackBy pour *ngFor sur la liste des compétences
  trackCompetenceProfessionById(index: number, compProfession: CompetenceProfession): number {
    return compProfession.idCompetenceProfession || index; // Utiliser l'identifiant s'il est disponible, sinon l'index
  }

}
