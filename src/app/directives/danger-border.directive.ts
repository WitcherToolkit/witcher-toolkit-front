import { Directive, ElementRef, input } from '@angular/core';
import { getDangerColor } from '../models/envoutement';

@Directive({
  selector: '[appDangerBorder]'
})
export class DangerBorderDirective {

  dangerValue = input.required<string>();

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.el.nativeElement.style.borderWidth = '1px';
    this.el.nativeElement.style.borderStyle = 'solid';
    this.applyBorderColor();
  }

  private applyBorderColor() {
    const color = getDangerColor(this.dangerValue());
    this.setBorderColor(color);
  }

  private setBorderColor(color: string) {
    this.el.nativeElement.style.borderColor = color;
  }
}
