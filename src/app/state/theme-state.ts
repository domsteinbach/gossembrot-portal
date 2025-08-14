import { Action, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { GsmbTheme } from '../model/theme';

// Themes
export class UpdateTheme {
  static readonly type = '[App] Update theme';
  constructor(public theme: GsmbTheme) {}
}

@State<GsmbTheme | null>({
  name: 'theme',
  defaults: null,
})
@Injectable()
export class SelectedThemeState {
  @Action(UpdateTheme)
  updateTheme(
    { getState, setState }: StateContext<GsmbTheme>,
    { theme }: UpdateTheme
  ) {
    setState(theme);
  }
}
