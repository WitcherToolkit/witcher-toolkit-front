import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Magie } from '../../../models/magie';
import { MAGIE_LIST } from '../../../fake-data-set/magie-fake';
import { PROFESSION_LIST } from '../../../fake-data-set/profession-fake';

@Component({
  selector: 'app-part4',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './part4.component.html',
  styles: ``
})
export class Part4Component implements OnInit {
  @Input() form!: FormGroup;
  selectedMagies!: FormArray;
  magieDisponible: Magie[] = [];
  magieInstruction: string = '';
  magieNom: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.selectedMagies = this.fb.array([]);
    this.form.addControl('selectedMagies', this.selectedMagies);
    this.form.addControl('magiePersonnage', this.fb.control([]));

    // Initialiser la magie en fonction de la profession sélectionnée
    this.updateMagieDisponible();

    // Réagir au changement de profession
    this.form.get('profession')?.valueChanges.subscribe(() => {
      this.updateMagieDisponible();
      this.clearInvalidMagies();
    });

    this.selectedMagies.valueChanges.subscribe(() => {
      this.convertMagieToObject();
    });
  }

  updateMagieDisponible() {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = PROFESSION_LIST.find(p => p.id === +selectedProfessionId);
  
    if (!selectedProfession) {
      this.magieDisponible = [];
      this.magieInstruction = '';
      return;
    }
  
    let filtreType = '';
    if (selectedProfession.nom === 'Mage') {
      filtreType = 'Sort';
      this.magieInstruction = 'Choisir 5 sorts';
      this.magieNom = 'Sorts';
    } else if (selectedProfession.nom === 'Prêtre') {
      filtreType = 'Invocation';
      this.magieInstruction = 'Choisir 2 invocations';
      this.magieNom = 'Invocations';
    } else {
      this.magieInstruction = '';
    }
  
    this.magieDisponible = MAGIE_LIST.filter(
      magie => magie.niveau === 'Novice' && magie.type === filtreType
    );
  }

  clearInvalidMagies() {
    // Supprimer les magies qui ne sont plus valides pour la profession
    const validNames = this.magieDisponible.map(m => m.nom);
    const toKeep = this.selectedMagies.controls.filter(ctrl => validNames.includes(ctrl.value));

    this.selectedMagies.clear();
    toKeep.forEach(ctrl => this.selectedMagies.push(ctrl));

    this.convertMagieToObject();
  }

  // Méthode pour gérer le changement d'état de la case à cocher
  onCheckboxChange(e: any) {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      const maxSelectable = this.getMaxSelectableMagies();
      if (this.selectedMagies.length >= maxSelectable) {
        alert(`Vous ne pouvez sélectionner que ${maxSelectable} sorts.`);
        e.target.checked = false;
        return;
      }
      this.selectedMagies.push(new FormControl(value));
    } else {
      const index = this.selectedMagies.controls.findIndex(x => x.value === value);
      if (index !== -1) {
        this.selectedMagies.removeAt(index);
      }
    }

    this.convertMagieToObject();
  }

  // Méthode pour ajouter une magie à la liste des magies sélectionnées
  convertMagieToObject() {
    const magieList = this.selectedMagies.controls
      .map(control => this.magieDisponible.find(m => m.nom === control.value))
      .filter(Boolean) as Magie[];

    this.form.get('magiePersonnage')?.patchValue(magieList);
  }

  // Méthode pour supprimer une magie de la liste des magies sélectionnées
  removeChip(nom: string) {
    const index = this.selectedMagies.controls.findIndex(x => x.value === nom);
    if (index !== -1) {
      this.selectedMagies.removeAt(index);
    }
    this.convertMagieToObject();
  }

  // Méthode pour vérifier si une magie est déjà sélectionnée
  private getMaxSelectableMagies(): number {
    const selectedProfessionId = this.form.get('profession')?.value;
    const selectedProfession = PROFESSION_LIST.find(p => p.id === +selectedProfessionId);
    if (!selectedProfession) return Infinity;

    if (selectedProfession.nom === 'Prêtre') return 2;
    if (selectedProfession.nom === 'Mage') return 5;
    return Infinity;
  }

  // Méthode pour vérifier si une magie est désactivée
  isMagieDisabled(nom: string): boolean {
    const max = this.getMaxSelectableMagies();
    return (
      this.selectedMagies.length >= max &&
      !this.selectedMagies.controls.some(c => c.value === nom)
    );
  }
}

