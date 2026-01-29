import { CarrierText } from "../model/carriertext";
import { Page } from "../model/page";
import { Action, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { GsmbTileSource } from "../service/tile-source.service";
import { PageRepository } from "../data/repository/page-repository";
import { take } from "rxjs";

export class UpdateSelectedCarrierText {
  static readonly type = "[App] Update CarrierText";
  constructor(public carrierText: CarrierText | undefined) {}
}

export class UpdateSelectedPage {
  static readonly type = "[App] Update SelectedPage";
  constructor(public page: Page | undefined) {}
}

export class UpdateDisplayedPages {
  static readonly type = "[App] Update DisplayedPages";
  constructor(public displayedPages: Page[]) {}
}

export class UpdateDoubleTileSources {
  static readonly type = "[App] Update TileSources";
  constructor(public tileSources: GsmbTileSource[]) {}
}

// Text state
@State<CarrierText | undefined>({
  name: "carrierText",
  defaults: undefined,
})
@Injectable()
export class SelectedCarrierTextState {
  @Action(UpdateSelectedCarrierText)
  updateText(
    { getState, setState }: StateContext<CarrierText | undefined>,
    { carrierText }: UpdateSelectedCarrierText,
  ) {
    setState(carrierText);
  }
}

// single page state
@State<Page | undefined>({
  name: "selectedPage",
  defaults: undefined,
})
@Injectable()
export class SelectedPageState {
  @Action(UpdateSelectedPage)
  updateSelectedPage(
    { getState, setState }: StateContext<Page | undefined>,
    { page }: UpdateSelectedPage,
  ) {
    setState(page);
  }
}

export class UpdateSelectedSrcCarrierPages {
  static readonly type = "[App] Update Pages";
  constructor(public carrierPages: Page[]) {}
}

// Action to fetch carrier texts if not available in state
export class FetchCarrierPages {
  static readonly type = "[App] Fetch Carrier Pages";
  constructor(public carrierId: string) {}
}

// pages state: All the pages available for one selected carrier
@State<Page[]>({
  name: "carrierPages",
  defaults: [],
})
@Injectable()
export class SelectedCarrierPagesState {
  constructor(private _pr: PageRepository) {}

  @Action(UpdateSelectedSrcCarrierPages)
  updatePages(
    { getState, setState }: StateContext<Page[]>,
    { carrierPages }: UpdateSelectedSrcCarrierPages,
  ) {
    setState(carrierPages);
  }
  // Action to fetch carrier texts if not available in state
  @Action(FetchCarrierPages)
  fetchCarrierPages(
    { getState, setState, dispatch }: StateContext<Page[]>,
    { carrierId }: FetchCarrierPages,
  ) {
    const state = getState();
    if (state.length > 0 && carrierId == state[0].carId) {
      // Return if data is already available in the store for that carrier
      return;
    } else {
      this._pr
        .pagesOfCarrier$(carrierId)
        .pipe(take(1))
        .subscribe((pages) => {
          if (!pages || pages.length === 0) {
            // guard
            return;
          }
          dispatch(new UpdateSelectedSrcCarrierPages(pages));
        });
    }
  }
}

// displayed pages state
@State<Page[]>({
  name: "displayedPages",
  defaults: [],
})
@Injectable()
export class DisplayedPagesState {
  @Action(UpdateDisplayedPages)
  updateDisplayedPages(
    { getState, setState }: StateContext<Page[]>,
    { displayedPages }: UpdateDisplayedPages,
  ) {
    setState(displayedPages);
  }
}

// The selected tile source for the osd viewer
@State<GsmbTileSource | null>({
  name: "tileSource",
  defaults: null,
})
// The selected tile sources for the osd viewer
@State<GsmbTileSource[]>({
  name: "tileSources",
  defaults: [],
})
@Injectable()
export class DoubleTileSourcesState {
  @Action(UpdateDoubleTileSources)
  updateDoubleTileSources(
    { getState, setState }: StateContext<GsmbTileSource[]>,
    { tileSources }: UpdateDoubleTileSources,
  ) {
    setState(tileSources);
  }
}

// For debugging purposes, we keep a separate state for the local tile sources
export class UpdateLocalDoubleTileSources {
  static readonly type = "[App] Update local TileSources";
  constructor(public localTileSources: GsmbTileSource[]) {}
}

@State<GsmbTileSource[]>({
  name: "localTileSources",
  defaults: [],
})
@Injectable()
export class LocalDoubleTileSourcesState {
  @Action(UpdateLocalDoubleTileSources) // ✅ corrected
  updateLocalDoubleTileSources(
    { getState, setState }: StateContext<GsmbTileSource[]>,
    { localTileSources }: UpdateLocalDoubleTileSources,
  ) {
    setState(localTileSources);
  }
}
