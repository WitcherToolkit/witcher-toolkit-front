import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor() { }

  // Définition des messages d'erreur pour chaque type de validateur
  // Les fonctions permettent de passer des paramètres dynamiques au message
  private errorMessages: { [key: string]: string | ((error: any) => string) } = {
    required: 'Ce champ est requis.',
    //minlength: (error: any) => `Minimum ${error.requiredLength} caractères. (Actuel: ${error.actualLength})`,
    maxlength: (error: any) => `Maximum ${error.requiredLength} caractères. (Actuel: ${error.actualLength})`,
    //pattern: 'Format invalide.',
    //range: (error: any) => `Doit être entre ${error.min} et ${error.max}.`,
    // Ajoutez d'autres messages pour vos validateurs personnalisés ici
  };

  /**
   * Retourne le premier message d'erreur pertinent pour un ensemble d'erreurs de validation.
   * @param errors L'objet ValidationErrors du contrôle de formulaire (contient les erreurs actives).
   * @returns Le message d'erreur formaté, ou null si aucune erreur n'est présente.
   */
  getErrorMessage(errors: ValidationErrors | null): string | null {
    // Si aucune erreur n'est passée, il n'y a pas de message à afficher
    if (!errors) {
      return null;
    }

    // Récupère la première clé d'erreur (Angular liste les erreurs par ordre de priorité,
    // donc la première est généralement la plus pertinente à afficher)
    const errorKey = Object.keys(errors)[0];
    // Récupère la fonction ou la chaîne de message associée à cette clé d'erreur
    const errorMessageGenerator = this.errorMessages[errorKey];

    // Si un générateur de message est trouvé
    if (errorMessageGenerator) {
      // Si c'est une fonction, l'appelle avec les détails de l'erreur pour obtenir le message dynamique
      if (typeof errorMessageGenerator === 'function') {
        return errorMessageGenerator(errors[errorKey]);
      }
      // Sinon, retourne la chaîne de message statique
      return errorMessageGenerator;
    }

    // Message par défaut si la clé d'erreur n'est pas reconnue dans notre liste
    return 'Erreur de validation inconnue.';
  }

}
