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
  // --- Entrées et références ---
  @Input() profession: Profession | null = null;
  @ViewChild('modal') modalRef!: ElementRef;

  // --- Services et signaux ---
  private readonly professionsService = inject(ProfessionsService);
  readonly detailedProfession = signal<Profession | null>(null);

  constructor() {}

  // --- Cycle de vie ---
  ngAfterViewInit() {
    if (this.modalRef && M && M.Modal) {
      M.Modal.init(this.modalRef.nativeElement);
    }
  }

  // --- Ouvre la modale et charge les détails ---
  open() {
    if (this.profession?.idProfession) {
      this.fetchProfessionDetails(this.profession.idProfession);
    }
    if (this.modalRef && M && M.Modal) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      if (instance) {
        instance.open();
      }
    }
  }

  // --- Récupère les détails de la profession depuis le service ---
  fetchProfessionDetails(id: number) {
    this.professionsService.getProfessionCompetences(id).subscribe({
      next: (data: Profession) => {
        this.detailedProfession.set(data);
      },
      error: (err) => {
        console.error('Error fetching profession details:', err);
        this.detailedProfession.set(null);
      }
    });
  }

  // --- Accès filtré à l'inventaire ---
  get inventaireNormaux() {
    return this.detailedProfession()?.inventaireWikiList?.filter(i => !i.special) || [];
  }

  get inventaireSpeciaux() {
    return this.detailedProfession()?.inventaireWikiList?.filter(i => i.special === true) || [];
  }

  // --- Accès aux compétences de la profession ---
  get competences(): CompetenceProfession[] {
    return this.detailedProfession()?.competenceList || [];
  }

  // --- TrackBy pour *ngFor sur la liste des compétences ---
  trackCompetenceProfessionById(index: number, compProfession: CompetenceProfession): number {
    return compProfession.idCompetenceProfession || index;
  }
}
