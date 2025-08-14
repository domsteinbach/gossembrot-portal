import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { DisplayVerweis } from '../../model/verweis';

@Component({
  template: `
    <div class="lost-snackbar-wrapper">
      <div class="lost-snackbar-content">
        {{ data.targetBelegstelleObj?.blattangabeWIthBlPrefix }} ist in {{ data.targetCarObj?.title }} verloren.
      </div>
      <div class="bottom-container">
        <button color="primary" mat-raised-button (click)="close()">Schließen</button>
      </div>
    </div>
  `,
  styles: [`
    .lost-snackbar-wrapper {
      padding: 16px;
    }
    
    .lost-snackbar-content {
      font-size: 1.2em;
    }
    .bottom-container {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--margin-medium);
    }
  `]
})
export class LostSnackbarComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: DisplayVerweis,
              private snackBarRef: MatSnackBarRef<LostSnackbarComponent>,
  ){}

  close() {
    this.snackBarRef.dismiss();
  }
}
