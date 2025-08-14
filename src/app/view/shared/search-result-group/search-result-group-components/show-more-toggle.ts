import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-show-more-toggle',
  template: `
    <div
      *ngIf="results > offset && !showAll"
      (click)="toggle(true)"
      class="show-more-link"
    >
      mehr anzeigen ...
    </div>
    <div
      *ngIf="results > offset && showAll"
      (click)="toggle(false)"
      class="show-more-link"
    >
      weniger anzeigen ...
    </div>
  `,
  styles: [`
    .show-more-link {
      color: var(--primary);
      display: block;
      padding: 0.5rem 3rem;
      font-size: 0.875rem;
      cursor: pointer;
      text-align: left;

      &:hover {
        font-weight: bold;
      }
    }
  `]
})
export class ShowMoreToggleComponent {
  @Input() results = 0;
  @Input() offset = 5;
  showAll = false;

  @Output() showAllChange = new EventEmitter<boolean>();

  toggle(value: boolean) {
    this.showAll = value;
    this.showAllChange.emit(value);
  }
}
