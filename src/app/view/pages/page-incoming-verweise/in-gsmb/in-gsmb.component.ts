import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Store } from "@ngxs/store";
import { CarriersState } from "../../../../state/information-carrier-state.service";
import { map } from "rxjs";
import { InformationCarrier } from "../../../../model/infoCarrier";

@Component({
  selector: "app-in-gsmb",
  templateUrl: "./in-gsmb.component.html",
  styleUrls: ["./in-gsmb.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InGsmbComponent {
  manuscriptsInGsmb$ = this._store
    .select(CarriersState)
    .pipe(
      map((carriers) =>
        carriers.filter(
          (carrier: InformationCarrier) =>
            carrier.isLost &&
            carrier.inGsmbsLib &&
            carrier.carrierType === "Manuscript",
        ),
      ),
    );

  constructor(private _store: Store) {}
}
