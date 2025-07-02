import { Directive, ElementRef, HostListener, input } from '@angular/core';
import { getDangerColor } from '../models/envoutement';

@Directive({
  selector: '[appDangerBorder]'
})
export class DangerBorderDirective {

  dangerValue = input.required<string>();

  constructor(private el: ElementRef) { }

  ngOnInit() {
    const color = getDangerColor(this.dangerValue());
    this.el.nativeElement.style.borderWidth = '1px';
    this.el.nativeElement.style.borderStyle = 'solid';
    this.el.nativeElement.style.borderColor = color;
    this.el.nativeElement.style.boxSizing = 'border-box';
    this.el.nativeElement.style.transition = 'box-shadow 0.15s, border-color 0.15s';
    this.el.nativeElement.style.boxShadow = 'none';
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    const color = getDangerColor(this.dangerValue());
    this.el.nativeElement.style.boxShadow = `0 0 0 1px ${color}`;
    this.el.nativeElement.style.cursor = 'pointer';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.boxShadow = 'none';
    this.el.nativeElement.style.cursor = 'default';
  }
}
