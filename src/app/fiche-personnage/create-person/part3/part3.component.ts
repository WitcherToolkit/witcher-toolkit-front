import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-part3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part3.component.html',
  styles: ``
})
export class Part3Component implements OnInit {
  @Input() form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.addControl('email', this.fb.control(''));
    this.form.addControl('description', this.fb.control(''));
  }
}