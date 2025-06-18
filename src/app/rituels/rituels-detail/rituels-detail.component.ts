import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Rituel } from '../../models/rituel';

declare var M: any;//Déclaration de M pour Materialize CSS

@Component({
  selector: 'app-rituels-detail-modal',
  standalone: true,
  templateUrl: './rituels-detail.component.html',
  styleUrls: []
})
export class RituelsDetailComponent implements AfterViewInit {
  @Input() rituel: Rituel | null = null;
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
