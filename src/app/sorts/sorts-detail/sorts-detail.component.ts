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
  @Input() magie: Magie | null = null;
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
