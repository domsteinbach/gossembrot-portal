
// State to manage texts of the selected carrier
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DisplayCarrierText } from '../model/carriertext';
import { Injectable } from '@angular/core';

export class UpdateSelectedCarriersTexts {
  static readonly type = '[App] Update the texts of the selected Carrier';
  constructor(public carrierTexts: DisplayCarrierText[]) {}
}

@State<DisplayCarrierText[]>({
  name: 'carrierTexts',
  defaults: [],
})
@Injectable()
export class CarrierTextsState {

  @Selector()
  static getSelectedCarriersTexts(state: DisplayCarrierText[]): DisplayCarrierText[] {
    return [...state];
  }

  // Action to update carrier texts in state
  @Action(UpdateSelectedCarriersTexts)
  updateSelectedCarriersTexts(
    { setState }: StateContext<DisplayCarrierText[]>,
    { carrierTexts }: UpdateSelectedCarriersTexts
  ) {
    setState(carrierTexts);  }
}

