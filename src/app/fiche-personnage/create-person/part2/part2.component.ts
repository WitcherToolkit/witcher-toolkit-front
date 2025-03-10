import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-part2-origin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part2.component.html',
  styles: ``
})
export class Part2Component implements OnInit {
  @Input() form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.addControl('age', this.fb.control(''));
    this.form.addControl('gender', this.fb.group({
      name: this.fb.control(''),
      label: this.fb.control('')
    }));
  }
}