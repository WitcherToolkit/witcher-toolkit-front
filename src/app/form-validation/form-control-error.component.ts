import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormValidationService } from './form-validation.service';

@Component({
  selector: 'app-form-control-error',
  imports: [CommonModule],
  templateUrl: './form-control-error.component.html'
})
export class FormControlErrorComponent implements OnChanges {

  @Input() control: AbstractControl | null = null;
  errorMessage: string | null = null;

  constructor(private formValidationService: FormValidationService) {}

  // ngOnChanges est appelé lorsqu'une propriété d'entrée (@Input) change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control'] && this.control) {
      // Met à jour le message d'erreur initial
      this.updateErrorMessage();

      // S'abonne aux changements de statut du contrôle pour mettre à jour le message en temps réel
      // (par exemple, quand l'utilisateur tape ou efface du texte)
      this.control.statusChanges.subscribe(() => {
        this.updateErrorMessage();
      });
    }
  }

  /**
   * Met à jour la propriété errorMessage en utilisant le FormValidationService.
   */
  private updateErrorMessage(): void {
    if (this.control) {
      this.errorMessage = this.formValidationService.getErrorMessage(this.control.errors);
    } else {
      this.errorMessage = null;
    }
  }

}
