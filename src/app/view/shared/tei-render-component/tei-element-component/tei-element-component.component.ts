import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tei-element',
  template: `<span [matTooltip]="tooltip">{{ content }}</span>`,
})
export class TeiElementComponent {
  @Input() content!: string;
  @Input() tooltip!: string;
}
