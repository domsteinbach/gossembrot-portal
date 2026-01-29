import { Action, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Belegstelle } from "../model/belegstelle";
import { DisplayVerweis } from "../model/verweis";

export class UpdateSelectedSrcBelegstelle {
  static readonly type = "[App] Update selected source belegstelle";
  constructor(public selectedSrcBelegstelle: Belegstelle | undefined) {}
}

@State<Belegstelle | undefined>({
  name: "selectedSrcBelegstelle",
  defaults: undefined,
})
@Injectable()
export class SelectedSrcBelegstelleState {
  @Action(UpdateSelectedSrcBelegstelle)
  updateSelectedSrcBelegstelle(
    { getState, setState }: StateContext<Belegstelle | undefined>,
    { selectedSrcBelegstelle }: UpdateSelectedSrcBelegstelle,
  ) {
    setState(selectedSrcBelegstelle);
  }
}

export class UpdateSelectedTargetBelegstelle {
  static readonly type = "[App] Update selected target Belegstelle";
  constructor(public selectedTargetBelegstelle: Belegstelle) {}
}

// State for the selected target belegstelle
@State<Belegstelle | null>({
  name: "selectedTargetBelegstelle",
  defaults: null,
})
@Injectable()
export class SelectedTargetBelegstelleState {
  @Action(UpdateSelectedTargetBelegstelle)
  updateSelectedSrcBelegstelle(
    { getState, setState }: StateContext<Belegstelle | null>,
    { selectedTargetBelegstelle }: UpdateSelectedTargetBelegstelle,
  ) {
    setState(selectedTargetBelegstelle);
  }
}

export class UpdateSelectedVerweis {
  static readonly type = "[App] Update the selected verweis";
  constructor(public selectedVerweis: DisplayVerweis | null) {}
}

@State<DisplayVerweis | null>({
  name: "selectedVerweis",
  defaults: null,
})
@Injectable()
export class SelectedVerweisState {
  @Action(UpdateSelectedVerweis)
  updateSelectedVerweis(
    { getState, setState }: StateContext<DisplayVerweis | null>,
    { selectedVerweis }: UpdateSelectedVerweis,
  ) {
    setState(selectedVerweis);
  }
}
