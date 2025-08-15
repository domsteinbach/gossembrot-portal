import { Component, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Page } from '../../../model/page';
import { map } from 'rxjs';
import { GsmbTheme } from '../../../model/theme';
import { SelectedThemeState } from '../../../state/theme-state';
import { EnvConstants } from '../../../constants';

@Component({
  selector: 'app-lagensymbol',
  templateUrl: './lagensymbol.component.html',
  styles: `.invert-colors {
    filter: invert(100%);
  }`
})
export class LagensymbolComponent {

  @Input() page?: Page;

  themeBrightness$ = this._store
    .select(SelectedThemeState)
    .pipe(map((theme: GsmbTheme) => theme.brightness));

  get lagensymbol(): string {
    // Todo: change in data
    return  this.page ? `${EnvConstants.LAGENSYM_BASE_PATH}/Einzelseite/${this.page.lagenSym.split('/').pop()}` : '';
  }

  constructor(private _store: Store) {
  }
}
