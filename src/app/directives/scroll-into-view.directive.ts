import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appScrollIntoView]',
  exportAs: 'scrollIntoView',
})
export class ScrollIntoViewDirective {
  @Input() containerId!: string;

  public scrollToElement(targetId: string): void {
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } else { console.warn(`Element with ID ${targetId} not found.`); }
    }, 150);
  }
}
