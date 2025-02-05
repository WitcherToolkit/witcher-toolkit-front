import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCardBorder]'
})
export class CardBorderDirective {

  private initialColor: string;

  // Renderer2 permet de gérer les conflits entre les styles CSS et les styles inline
  constructor(private el: ElementRef, private renderer: Renderer2) { 
    this.initialColor = this.el.nativeElement.style.borderColor;
    //this.initialColor = "yellow";
    this.renderer.setStyle(this.el.nativeElement, 'border', `1px solid ${this.initialColor}`);
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.setBorderColor('#01579b');//#01579b light-blue darken-4
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.setBorderColor(this.initialColor);
  }

  private setBorderColor(color: string) { 
    this.renderer.setStyle(this.el.nativeElement, 'borderColor', color);
  }

}
