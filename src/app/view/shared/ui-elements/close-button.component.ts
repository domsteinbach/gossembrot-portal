import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ui-close-button',
  template: `
    <button mat-stroked-button color="primary" class="close-button" (click)="close.emit()">
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: `

    .close-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.8em;
      height: 1.8em;
      padding: 0;
      border-radius: 0.4em;
      min-width: 0; // override Angular Material default min-width
    }

    .close-button .mat-icon {
      line-height: 1;
      font-size: 1rem;
      margin: 0;
    }
  `
})
export class UiCloseButtonComponent {
  @Output() close = new EventEmitter<void>();
}
