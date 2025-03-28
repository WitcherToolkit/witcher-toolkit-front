import { Directive, ElementRef, HostListener, input } from '@angular/core';
import { getNatureColor } from '../models/magie';

@Directive({
  selector: '[appNatureBorder]'
})
export class NatureBorderDirective {
  // Utilisation de input.required<string>() pour Angular 17+
  natureValue = input.required<string>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.borderWidth = '1px';
    this.el.nativeElement.style.borderStyle = 'solid';
    this.applyBorderColor();
  }

  private applyBorderColor() {
    const color = getNatureColor(this.natureValue());
    this.setBorderColor(color);
  }

  private setBorderColor(color: string) {
    this.el.nativeElement.style.borderColor = color;
  }
}
