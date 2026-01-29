import { Component } from "@angular/core";
import { CarriersState } from "../../../../state/information-carrier-state.service";
import { Store } from "@ngxs/store";
import { map } from "rxjs";
import { InformationCarrier } from "../../../../model/infoCarrier";

@Component({
  selector: "app-prints",
  templateUrl: "./prints.component.html",
  styleUrl: "./prints.component.scss",
})
export class PrintsComponent {
  prints$ = this._store
    .select(CarriersState)
    .pipe(
      map((filter) =>
        filter.filter(
          (carrier: InformationCarrier) => carrier.carrierType === "Print",
        ),
      ),
    );

  constructor(private _store: Store) {}
}
