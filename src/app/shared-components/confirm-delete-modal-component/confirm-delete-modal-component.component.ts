import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal-component',
  standalone: true,
  imports: [],
  templateUrl: './confirm-delete-modal-component.component.html',
  styleUrls: ['./confirm-delete-modal-component.component.scss']
})
export class ConfirmDeleteModalComponentComponent implements AfterViewInit, OnChanges {
  @Input() itemName: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('modal') modalRef!: ElementRef;
  private modalInstance: any;

  ngAfterViewInit() {
    this.initModal();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemName'] && this.modalRef) {
      this.initModal();
      this.open();
    }
  }

  initModal() {
    if (this.modalRef) {
      const M = (window as any).M;
      this.modalInstance = M && M.Modal ? M.Modal.init(this.modalRef.nativeElement) : null;
    }
  }

  open() {
    if (this.modalInstance) {
      this.modalInstance.open();
    }
  }

  onConfirm() {
    this.confirm.emit();
    if (this.modalInstance) this.modalInstance.close();
  }

  onCancel() {
    this.cancel.emit();
    if (this.modalInstance) this.modalInstance.close();
  }
}
