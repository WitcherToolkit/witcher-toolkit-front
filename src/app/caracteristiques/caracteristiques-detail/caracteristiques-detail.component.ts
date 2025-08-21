import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Caracteristique } from '../../models/caracteristique';

@Component({
  selector: 'app-caracteristiques-detail-modal',
  standalone: true,
  templateUrl: './caracteristiques-detail.component.html'
})
export class CaracteristiquesDetailComponent implements AfterViewInit {
  // --- Entrées et références ---
  @Input() caracteristique: Caracteristique | null = null;
  @ViewChild('modal') modalRef!: ElementRef;

  // --- Initialisation de la modale Materialize ---
  ngAfterViewInit() {
    if (this.modalRef) {
      M.Modal.init(this.modalRef.nativeElement);
    }
  }

  // --- Ouvre la modale ---
  open() {
    if (this.modalRef) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      instance.open();
    }
  }
}
