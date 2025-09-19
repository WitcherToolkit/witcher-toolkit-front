import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

declare var M: any;

@Directive({
  selector: '[materializeTooltip]'
})
export class MaterializeTooltipDirective implements AfterViewInit, OnDestroy {
  private tooltipInstance: any;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.tooltipInstance = M.Tooltip.init(this.el.nativeElement);
    // Applique la largeur max à la tooltip de cet élément
    setTimeout(() => {
      const instance = M.Tooltip.getInstance(this.el.nativeElement);
      if (instance && instance.tooltipEl) {
        instance.tooltipEl.style.maxWidth = '250px';
        instance.tooltipEl.style.whiteSpace = 'normal';
      }
    }, 0);
  }

  ngOnDestroy() {
    if (this.tooltipInstance) {
      this.tooltipInstance.destroy();
    }
  }
}
