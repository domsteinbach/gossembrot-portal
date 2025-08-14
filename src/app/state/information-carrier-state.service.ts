import { InformationCarrier } from '../model/infoCarrier';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { PageRepository } from '../data/repository/page-repository';
import { combineLatest, take } from 'rxjs';
import { UpdateSelectedCarrierText, UpdateSelectedPage, UpdateSelectedSrcCarrierPages } from './app-state';
import { CarrierTextRepository } from '../data/repository/carrier-text-repository';
import { UpdateSelectedCarriersTexts } from './carriertext-state';

export class UpdateCarriers {
  static readonly type = '[App] Update Carriers';
  constructor(
    public carriers: InformationCarrier[],
  ) {}
}

// State for the info carriers
@State<InformationCarrier[]>({
  name: 'carriers',
  defaults: [],
})
@Injectable()
export class CarriersState {
  @Action(UpdateCarriers)
  updateCarriers(
    { getState, setState }: StateContext<InformationCarrier[]>,
    { carriers }: UpdateCarriers
  ) {
    setState(carriers);
  }

  @Selector()
  static existingManuscripts(state: InformationCarrier[]): InformationCarrier[] {
    return state
      .filter(
        (carrier) =>
          !carrier.isLost &&
          carrier.carrierType === 'Manuscript')
      .sort((a, b) => a.title.localeCompare(b.title));
  }
}

export class UpdateSelectedSrcInformationCarrier {
  static readonly type = '[App] Update Source InformationCarrier';
  constructor(public informationCarrier: InformationCarrier, public pageId?: string, public carrierTextId?: string) {}
}

@State<InformationCarrier | null>({
  name: 'selectedSrcInformationCarrier',
  defaults: null,
})
@Injectable()
export class SelectedSrcInformationCarrierState {

  constructor(private _pr: PageRepository, private _store: Store, private _tr: CarrierTextRepository) {
  }

  @Action(UpdateSelectedSrcInformationCarrier)
  updateInformationCarrier(
    { setState }: StateContext<InformationCarrier>,
    { informationCarrier, pageId, carrierTextId }: UpdateSelectedSrcInformationCarrier
  ) {
    setState(informationCarrier);
    if (!informationCarrier || informationCarrier.id === this._store.selectSnapshot(SelectedSrcInformationCarrierState)) {
      return;
    }
    combineLatest([
      this._tr.getCarrierTextsOfCarrier$(informationCarrier.id).pipe(take(1)),
      this._pr.pagesOfCarrier$(informationCarrier.id).pipe(take(1)),
    ]).pipe(take(1)).subscribe(([texts = [], pages = []]) => {
      console.log(pages);
      this._store.dispatch(new UpdateSelectedCarriersTexts(texts.sort((a, b) => a.sortInCar - b.sortInCar)));
      this._store.dispatch(new UpdateSelectedSrcCarrierPages(pages));

      const textToSelect = carrierTextId ? texts.find(t => t.id === carrierTextId) : null;

      if (textToSelect) {
        this._store.dispatch(new UpdateSelectedCarrierText(textToSelect));

        const pagesOfText = pages.filter((p) => p.textId === textToSelect.id)
          .sort((a, b) => a.idx - b.idx);

        if (pagesOfText?.length) {
          this._store.dispatch(new UpdateSelectedPage(pagesOfText[0]));
        }
      } else {
        const page = pageId
          ? pages.find(p => p.id === pageId)
          : pages[informationCarrier.firstPageIdx];

        if (page) {
          this._store.dispatch(new UpdateSelectedPage(page));
        }
      }
    });
  }
}

export class UpdateSelectedTargetInformationCarrier {
  static readonly type = '[App] Update Target InformationCarrier';
  constructor(public informationCarrier: InformationCarrier) {}
}

@State<InformationCarrier | null>({
  name: 'selectedTargetInformationCarrier',
  defaults: undefined,
})
@Injectable()
export class SelectedTargetInformationCarrierState {
  @Action(UpdateSelectedTargetInformationCarrier)
  updateInformationCarrier(
    { getState, setState }: StateContext<InformationCarrier>,
    { informationCarrier }: UpdateSelectedTargetInformationCarrier
  ) {
    setState(informationCarrier);
  }
}

export class UpdateSelectedNodeInformationCarrier {
  static readonly type = '[App] Update Node InformationCarrier';
  constructor(public informationCarrier: InformationCarrier) {}
}

@State<InformationCarrier | null>({
  name: 'selectedNodeInformationCarrier',
  defaults: undefined,
})
@Injectable()
export class SelectedNodeInformationCarrierState {
  @Action(UpdateSelectedNodeInformationCarrier)
  updateNodeInformationCarrier(
    { getState, setState }: StateContext<InformationCarrier>,
    { informationCarrier }: UpdateSelectedNodeInformationCarrier
  ) {
    setState(informationCarrier);
  }
}


