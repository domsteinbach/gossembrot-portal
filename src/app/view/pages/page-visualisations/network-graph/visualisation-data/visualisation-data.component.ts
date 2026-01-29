import { ChangeDetectorRef, Component } from "@angular/core";
import { VisualisationDataService } from "../visualisation-data.service";
import { InformationCarrier } from "../../../../../model/infoCarrier";
import { take } from "rxjs";
import { CarrierText } from "../../../../../model/carriertext";
import { Store } from "@ngxs/store";
import { VerweisService } from "../../../../../service/verweis.service";
import { UpdateSelectedSrcInformationCarrier } from "../../../../../state/information-carrier-state.service";
import { DisplayVerweis } from "../../../../../model/verweis";
import { UpdateSelectedPage } from "../../../../../state/app-state";

@Component({
  selector: "app-visualisation-data",
  templateUrl: "./visualisation-data.component.html",
  styleUrl: "./visualisation-data.component.scss",
})
export class VisualisationDataComponent {
  activeTabIndex = 0;

  selectedCarrier: InformationCarrier | null = null;

  selectedExistingCarrier!: InformationCarrier | null;
  selectedClassicCarrier!: InformationCarrier | null;
  selectedMissingCarrier!: InformationCarrier | null;

  get display(): "incoming" | "outgoing" {
    return this.activeTabIndex === 0 ? "incoming" : "outgoing";
  }

  textsWithIncomingVerweise: CarrierText[] = [];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _visDataService: VisualisationDataService,
    private _vs: VerweisService,
  ) {
    this._visDataService.lastSelectedCarrier$.subscribe((carrier) => {
      this.setCarrier(carrier);
    });
  }

  onTabChange(tabIdx: number) {
    this.activeTabIndex = tabIdx;
    if (tabIdx < 2) {
      this._visDataService.setInteractionMode("info");
    }
  }

  setCarrier(carrier: InformationCarrier | null) {
    if (!carrier) {
      return;
    }
    this.selectedCarrier = carrier;
    this.selectedClassicCarrier =
      carrier?.physicality === "Classic" ? this.selectedCarrier : null;
    this.selectedMissingCarrier =
      carrier?.physicality === "Lost" ? this.selectedCarrier : null;
    this.selectedExistingCarrier =
      carrier?.physicality === "Available" ? this.selectedCarrier : null;

    this._store.dispatch(new UpdateSelectedSrcInformationCarrier(carrier));

    this._vs
      .getTextsWithIncomingVerweise(this.selectedCarrier?.id || "")
      .pipe(take(1))
      .subscribe((texts) => {
        this.textsWithIncomingVerweise = texts;
        this._cdr.detectChanges();
      });
  }

  onIncomingVerweisClicked(verweis: DisplayVerweis) {
    this._visDataService.selectVerweis(verweis);
  }

  onVerweisSelected(verweis: DisplayVerweis | undefined): void {
    this._store.dispatch(
      new UpdateSelectedPage(verweis?.srcBelegstelleObj?.page),
    );
  }
}
