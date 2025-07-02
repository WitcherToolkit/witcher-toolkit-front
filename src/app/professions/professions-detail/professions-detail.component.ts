import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Profession } from '../../models/profession';

@Component({
  selector: 'app-professions-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professions-detail.component.html'
})
export class ProfessionsDetailComponent implements AfterViewInit {
  @Input() profession: Profession | null = null;
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
