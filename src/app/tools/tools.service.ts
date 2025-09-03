import { Injectable } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

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

  // Méthode générique pour calculer les points restants
  calculatePointsRestants(totalPoints: number, formArray: FormArray, isPrincipaleFn: (code: string) => boolean): number {
    // Calcul des points dépensés (uniquement pour les principales)
    const pointsDepenses = formArray.controls.reduce((sum, control) => {
      const code = control.get('code')?.value;
      if (isPrincipaleFn(code)) {
        return sum + (control.get('valeurMax')?.value || 0);
      }
      return sum;
    }, 0);
    return totalPoints - pointsDepenses;
  }

}
