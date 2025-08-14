import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DisplayVerweis } from '../model/verweis';
import { Store } from '@ngxs/store';
import { SelectedVerweisState } from '../state/belegstelle-state.service';
import { SelectedThemeState } from '../state/theme-state';
import { GsmbThemeClass, ThemeBrightness } from '../model/theme';
import { LostSnackbarComponent } from '../view/shared/lost-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class LostPageNotificationService {

  constructor(private _snackBar: MatSnackBar, private _store: Store) {

    const brightness: ThemeBrightness = this._store.selectSnapshot(SelectedThemeState).brightness;
    const panelClass: GsmbThemeClass = brightness === 'dark' ? 'dark-theme' : 'old-brick-theme';
    this._store.select(SelectedVerweisState).subscribe((verweis: DisplayVerweis) => {
      if (verweis && verweis.targetCarPhysicality === 'Available' && verweis.targetBelegstelleObj?.lost) {
        this._snackBar.openFromComponent(LostSnackbarComponent, {
          data: verweis,
          duration: 10000,
          panelClass: [panelClass]
        });
      }
    });
  }
}
