import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Magie } from '../../models/magie';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControlErrorComponent } from '../../form-validation/form-control-error.component';
import { RequiredAsteriskDirective } from '../../directives/required-asterisk.directive';

@Component({
  selector: 'app-sorts-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormControlErrorComponent, RequiredAsteriskDirective],// Utilisation de ReactiveFormsModule pour les formulaires
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
        nom: [this.magie.nom, [Validators.required, Validators.maxLength(60)]],
        cout: [this.magie.cout, [Validators.required, Validators.maxLength(10)]],
        duree: [this.magie.duree, [Validators.required, Validators.maxLength(35)]],
        portee: [this.magie.portee, [Validators.maxLength(15)]],
        nature: [this.magie.nature, [Validators.required, Validators.maxLength(5)]],
        type: [this.magie.type, [Validators.required, Validators.maxLength(10)]],
        contre: [this.magie.contre, [Validators.maxLength(25)]],
        niveau: [this.magie.niveau, [Validators.required, Validators.maxLength(35)]],
        effet: [this.magie.effet, [Validators.required]]
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
