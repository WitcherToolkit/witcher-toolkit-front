import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Magie } from '../../models/magie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sorts-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sorts-detail.component.html',
  styleUrls: []
})
export class SortsDetailComponent implements AfterViewInit {
  // --- Entrées et références ---
  @Input() magie: Magie | null = null;
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
