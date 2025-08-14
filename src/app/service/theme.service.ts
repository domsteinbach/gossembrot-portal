import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateTheme } from '../state/theme-state';
import { GsmbTheme, ThemeBrightness, THEMES } from '../model/theme';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeHandlerService {
  private _themes: GsmbTheme[] = THEMES;
  private _selectedTheme: GsmbTheme = this._themes[0];
  private _usersFavoriteTheme: GsmbTheme = this._themes[0];

  constructor(
    private _store: Store,
    private _localStorageService: LocalStorageService
  ) {
    const storedTheme = this._localStorageService.theme;
    this._selectedTheme = storedTheme
      ? this._getTheme(storedTheme.name)
      : this._themes[0];
    this._store.dispatch(new UpdateTheme(this._selectedTheme));
  }

  get brightness(): ThemeBrightness {
    return this._selectedTheme.brightness;
  }

  selectTheme(theme: GsmbTheme) {
    this._selectedTheme = theme;
    this._localStorageService.theme = theme;
    this._store.dispatch(new UpdateTheme(theme));
  }

  private _getTheme(name: string): GsmbTheme {
    return this._themes.find((theme) => theme.name === name) || this._themes[0];
  }

  toggleBrightness() {
    if (this.brightness !== this._usersFavoriteTheme.brightness) {
      // if the current brightness is not the one of the users favorite, switch to the users favorite
      this.selectTheme(this._usersFavoriteTheme);
    } else {
      // if the current brightness is the one of the users favorite, switch to the first found theme of other brightness
      const theme =
        this._themes.find((theme) => theme.brightness !== this.brightness) ||
        this._themes[0];
      this.selectTheme(theme);
    }
  }
}
