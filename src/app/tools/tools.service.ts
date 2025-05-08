import { Injectable } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { PROFESSION_MAP } from '../fake-data-set/profession-fake';
import { CaracteristiqueService } from '../caracteristiques/caracteristique.service';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor() { }

  // Méthode générique pour supprimer un élément d'un FormArray
  removeItemFromFormArray(formArray: FormArray, itemValue: any, updateFunction: Function): void {
    const index = formArray.controls.findIndex(x => x.value === itemValue);
    if (index !== -1) {
      formArray.removeAt(index);
    }
    // Appeler la fonction de mise à jour spécifique (par exemple, convertInventaireToObject)
    updateFunction();
  }

  // Méthode générique pour filtrer et garder les éléments valides dans un FormArray
  clearInvalidItems(formArray: FormArray, validItems: any[], updateFunction: Function): void {
    const validNames = validItems.map(item => item.nom);
    
    // Filtrer les contrôles pour garder ceux qui sont valides
    const toKeep = formArray.controls.filter(ctrl => validNames.includes(ctrl.value));
    
    // Réinitialiser le FormArray et réajouter les éléments valides
    formArray.clear();
    toKeep.forEach(ctrl => formArray.push(ctrl));

    // Appeler la fonction de mise à jour spécifique (par exemple, convertMagieToObject)
    updateFunction();
  }

  // Méthode générique pour gérer les changements d'état des cases à cocher
  handleCheckboxChange(
    e: any, 
    selectedArray: FormArray, 
    maxSelectableFn: () => number, 
    convertFn: () => void
  ): void {
    const value = e.target.value;
    const isChecked = e.target.checked;
    const maxSelectable = maxSelectableFn();
  
    if (isChecked) {
      if (selectedArray.length >= maxSelectable) {
        alert(`Vous ne pouvez sélectionner que ${maxSelectable} éléments.`);
        e.target.checked = false; // Annule le changement
        return;
      }
      selectedArray.push(new FormControl(value)); // Ajoute l'élément
    } else {
      const index = selectedArray.controls.findIndex(x => x.value === value);
      if (index !== -1) {
        selectedArray.removeAt(index); // Supprime l'élément
      }
    }
    convertFn(); // Appelle la fonction pour convertir l'objet (comme convertInventaireToObject, etc.)
  }

  // Méthode générique pour obtenir le nombre maximum d'éléments sélectionnables en fonction de la profession
  getMaxSelectableItems(professionId: number | null, professionLimits: { [key: string]: number }): number {
    const professionName = PROFESSION_MAP[professionId || 0];

    if (!professionName) return Infinity;

    // Si une limite spécifique existe pour la profession, retournez cette limite.
    if (professionLimits[professionName]) {
      return professionLimits[professionName];
    }

    return Infinity; // Par défaut, aucun plafond, donc renvoie Infinity
  }

  // Méthode générique pour vérifier si un élément est désactivé en fonction de la sélection actuelle et du maximum autorisé
  isItemDisabled(selectedItems: any[], maxSelectable: number, itemName: string): boolean {
    return (selectedItems.length >= maxSelectable && !selectedItems.some(c => c.value === itemName));
  }

  // Incrémentation générique d'une valeur dans un FormGroup (par index)
  incrementFormControlValue(formArray: FormArray, index: number, controlName: string, maxValue: number): void {
    const control = formArray.at(index).get(controlName);
    if (control && control.value < maxValue) {
      control.setValue(control.value + 1);
    }
  }

  // Décrémentation générique d'une valeur dans un FormGroup (par index)
  decrementFormControlValue(formArray: FormArray, index: number, controlName: string, minValue: number): void {
    const control = formArray.at(index).get(controlName);
    if (control && control.value > minValue) {
      control.setValue(control.value - 1);
    }
  }

  // Méthode générique pour calculer les points restants
  calculatePointsRestants(totalPoints: number, formArray: FormArray, isEditableFn: (code: string) => boolean): number {
    // Calcul des points dépensés
    const pointsDepenses = formArray.controls.reduce((sum, control) => {
      const code = control.get('code')?.value;
      if (isEditableFn(code)) {
        return sum + (control.get('valeurMax')?.value || 0);
      }
      return sum;
    }, 0);

    // Mise à jour des points restants
    return totalPoints - pointsDepenses;
  }

}
