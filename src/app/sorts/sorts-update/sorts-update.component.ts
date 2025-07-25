import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Magie } from '../../models/magie';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sorts-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],// Utilisation de ReactiveFormsModule pour les formulaires
  templateUrl: './sorts-update.component.html',
  styleUrl: './sorts-update.component.css'
})
export class SortsUpdateComponent implements AfterViewInit, OnChanges {
  @Input() magie: Magie | null = null;
  @ViewChild('modal') modalRef!: ElementRef;

  magieForm!: FormGroup;

  constructor(private fb: FormBuilder){}

  ngOnChanges(changes: SimpleChanges) {// SimpleChanges permet de détecter les changements dans les propriétés d'entrée
    if (changes['magie'] && this.magie) {
      this.magieForm = this.fb.group({
        nom: [this.magie.nom],
        cout: [this.magie.cout],
        duree: [this.magie.duree],
        portee: [this.magie.portee],
        nature: [this.magie.nature],
        type: [this.magie.type],
        contre: [this.magie.contre],
        niveau: [this.magie.niveau],
        effet: [this.magie.effet]
      });
    }
  }

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

  onSubmit() {
    console.log('Formulaire soumis :', this.magieForm.value);
  }

}
