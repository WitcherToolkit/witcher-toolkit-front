import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  // Le sélecteur est maintenant '[required]' pour cibler directement les éléments avec cet attribut
  selector: '[required]',
  standalone: true
})
export class RequiredAsteriskDirective implements AfterViewInit {

  constructor(
    private el: ElementRef, // Référence à l'élément DOM sur lequel la directive est appliquée (l'input, select, textarea)
    private renderer: Renderer2, // Un service Angular pour manipuler le DOM de manière sécurisée
    // NgControl n'est plus injecté car nous ne vérifions plus les validateurs Angular
    // private control: NgControl
  ) {}

  ngAfterViewInit(): void {
    // Vérifie si l'élément HTML sur lequel la directive est appliquée a l'attribut 'required'
    if (this.el.nativeElement.hasAttribute('required')) {

      // Retarder l'exécution pour s'assurer que MaterializeCSS a fini ses manipulations DOM
      setTimeout(() => {
        const inputId = this.el.nativeElement.id;

        if (inputId) {
          // Recherche le conteneur .input-field de MaterializeCSS
          const parentInputField = this.el.nativeElement.closest('.input-field');
          // Puis recherche le label à l'intérieur de ce conteneur
          const labelElement = parentInputField ? parentInputField.querySelector(`label[for="${inputId}"]`) : null;

          if (labelElement) {
            // Vérifie si l'astérisque n'est pas déjà présent pour éviter les doublons
            if (!labelElement.textContent.endsWith('*')) {
              const asterisk = this.renderer.createText('*');
              this.renderer.appendChild(labelElement, asterisk);
            }
          } else {
            // Pour le débogage : si le label n'est toujours pas trouvé
            console.warn(`RequiredAsteriskDirective: Label for input with ID "${inputId}" not found.`);
          }
        } else {
          // Pour le débogage : si l'input n'a pas d'ID
          console.warn('RequiredAsteriskDirective: Input element has no ID. Cannot add asterisk to label.');
        }
      }, 0); // Le délai de 0 ms met la tâche à la fin de la file d'attente des événements
    }
  }
}
