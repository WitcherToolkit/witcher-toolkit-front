import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RACE_LIST } from '../../../fake-data-set/race-fake';
import { PROFESSION_LIST } from '../../../fake-data-set/profession-fake';

@Component({
  selector: 'app-part1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part1.component.html',
  styles: ``
})
export class Part1Component implements OnInit {
  @Input() form!: FormGroup;
  races = RACE_LIST;
  professions = PROFESSION_LIST;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form.addControl('nomPersonnage', this.fb.control(''));
    this.form.addControl('nomJoueur', this.fb.control(''));
    this.form.addControl('genre', this.fb.control(''));
    this.form.addControl('terreNatale', this.fb.control(''));
    this.form.addControl('xp', this.fb.control(0)); // Valeur par défaut à 0
    this.form.addControl('age', this.fb.control(''));
    this.form.addControl('bestiaire', this.fb.control(false));
    this.form.addControl('historique', this.fb.control(''));
    this.form.addControl('profession', this.fb.control(''));
    this.form.addControl('race', this.fb.control(''));
  }

}
