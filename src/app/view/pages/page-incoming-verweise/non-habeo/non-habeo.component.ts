import { Component } from "@angular/core";
import { CarriersState } from "../../../../state/information-carrier-state.service";
import { map } from "rxjs";
import { InformationCarrier } from "../../../../model/infoCarrier";
import { Store } from "@ngxs/store";

@Component({
  selector: "app-non-habeo",
  templateUrl: "./non-habeo.component.html",
  styleUrl: "./non-habeo.component.scss",
})
export class NonHabeoComponent {
  nonHabeo$ = this._store
    .select(CarriersState)
    .pipe(
      map((filter) =>
        filter.filter(
          (carrier: InformationCarrier) => carrier.carrierType === "NonHabeo",
        ),
      ),
    );

  constructor(private _store: Store) {}
}
