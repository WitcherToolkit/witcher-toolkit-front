import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Competence } from '../../../models/competence';
import { COMPETENCE_LIST } from '../../../fake-data-set/competence-fake';

@Component({
  selector: 'app-part3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part3.component.html',
  styles: []
})
export class Part3Component implements OnInit {
  @Input() form!: FormGroup;
  competences: Competence[] = COMPETENCE_LIST;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.addControl('competences', this.fb.array([]));
    this.initCompetences();
  }

  get competencesArray(): FormArray {
    return this.form.get('competences') as FormArray;
  }

  private initCompetences() {
    if (!this.competences) {
      console.error('Competences are not defined');
      return;
    }

    this.competences
      .filter(competence => !competence.exclusif)
      .forEach(competence => {
        this.competencesArray.push(this.fb.group({
          valeurMax: [],
          competence: [competence]
        }));
      });
  }
}