import { Component } from '@angular/core';
import { Personnage } from '../../models/personnage';
import { CommonModule } from '@angular/common';
import { Part1Component } from "./part1/part1.component";
import { Part2Component } from './part2/part2.component';
import { Part3Component } from './part3/part3.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HighlightDirective } from '../../highlight.directive';
import { Part4Component } from './part4/part4.component';

@Component({
  selector: 'app-create-person',
  imports: [CommonModule,
            Part1Component,
            Part2Component,
            Part3Component,
            Part4Component,
            HighlightDirective],
  templateUrl: './create-person.component.html',
  styles: ``
})
export class CreatePersonComponent {
  currentStep = 1;
  //formData: Personnage = new Personnage();
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < 4) {
      console.log(`Etape ${this.currentStep} :`, this.form.value);
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      console.log(`Etape ${this.currentStep} :`, this.form.value);
      this.currentStep--;
    }
  }

  submitForm() {
    console.log('Form Data:', this.form.value);
    // Handle form submission
  }

  getProgressWidth(): string {
    switch (this.currentStep) {
      case 1:
        return '25%';
      case 2:
        return '50%';
      case 3:
        return '75%';
      case 4:
        return '100%';
      default:
        return '0%';
    }
  }

}
