import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Envoutement } from '../../models/envoutement';

@Component({
  selector: 'app-envoutements-detail-modal',
  imports: [],
  templateUrl: './envoutements-detail.component.html',
  styleUrls: []
})
export class EnvoutementsDetailComponent implements AfterViewInit {
  // --- Entrées et références ---
  @Input() envoutement: Envoutement | null = null;
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