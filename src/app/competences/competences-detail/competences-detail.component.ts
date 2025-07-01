import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Competence } from '../../models/competence';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-competences-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competences-detail.component.html'
})
export class CompetencesDetailComponent implements AfterViewInit {
  @Input() competence: Competence | null = null;
  @ViewChild('modal') modalRef!: ElementRef;

  ngAfterViewInit() {
    if (this.modalRef) {
      M.Modal.init(this.modalRef.nativeElement);
    }
  }

  open() {
    if (this.modalRef) {
      const instance = M.Modal.getInstance(this.modalRef.nativeElement);
      instance.open();
    }
  }

}
