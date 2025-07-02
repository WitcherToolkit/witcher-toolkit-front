import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSelectionBorder]'
})
export class SelectionBorderDirective {
  private borderColor = '#616161';

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.el.nativeElement.style.borderWidth = '1px';
    this.el.nativeElement.style.borderStyle = 'solid';
    this.el.nativeElement.style.borderColor = this.borderColor;
    this.el.nativeElement.style.boxSizing = 'border-box';
    this.el.nativeElement.style.transition = 'box-shadow 0.15s, border-color 0.15s';
    this.el.nativeElement.style.boxShadow = 'none';
    this.el.nativeElement.style.cursor = 'default';
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.boxShadow = `0 0 0 2px ${this.borderColor}`;
    this.el.nativeElement.style.cursor = 'pointer';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.boxShadow = 'none';
    this.el.nativeElement.style.cursor = 'default';
  }
}
