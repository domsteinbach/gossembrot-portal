// State to manage texts of the selected carrier
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { CarrierText } from "../model/carriertext";
import { Injectable } from "@angular/core";

export class UpdateSelectedCarriersTexts {
  static readonly type = "[App] Update the texts of the selected Carrier";
  constructor(public carrierTexts: CarrierText[]) {}
}

@State<CarrierText[]>({
  name: "carrierTexts",
  defaults: [],
})
@Injectable()
export class CarrierTextsState {
  @Selector()
  static getSelectedCarriersTexts(state: CarrierText[]): CarrierText[] {
    return [...state];
  }

  // Action to update carrier texts in state
  @Action(UpdateSelectedCarriersTexts)
  updateSelectedCarriersTexts(
    { setState }: StateContext<CarrierText[]>,
    { carrierTexts }: UpdateSelectedCarriersTexts,
  ) {
    setState(carrierTexts);
  }
}
