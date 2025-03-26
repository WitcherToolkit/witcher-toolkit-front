import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-part4',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part4.component.html',
  styles: ``
})
export class Part4Component implements OnInit {
  @Input() form! : FormGroup

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
