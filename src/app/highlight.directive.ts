import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnChanges{
  @Input() appHighlight = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appHighlight']) {
      if (this.appHighlight) {
        this.renderer.setStyle(this.el.nativeElement, 'color', 'red');
      } else {
        this.renderer.removeStyle(this.el.nativeElement, 'color');
      }
    }
  }
}
