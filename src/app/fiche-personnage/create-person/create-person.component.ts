import { Component } from '@angular/core';
import { Personnage } from '../../models/personnage';
import { CommonModule } from '@angular/common';
import { Part1Component } from "./part1/part1.component";
import { Part2Component } from './part2/part2.component';
import { Part3Component } from './part3/part3.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-person',
  imports: [CommonModule, Part1Component, Part2Component, Part3Component],
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
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitForm() {
    console.log('Form Data:', this.form.value);
    // Handle form submission
  }

}
