import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Race } from '../../models/race';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-races-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './races-detail.component.html',
  styleUrls: []
})
export class RacesDetailComponent implements AfterViewInit {
  @Input() race: Race | null = null;
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
