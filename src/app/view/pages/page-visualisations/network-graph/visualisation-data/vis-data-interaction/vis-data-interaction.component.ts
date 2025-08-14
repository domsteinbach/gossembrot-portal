import { Component, OnDestroy } from '@angular/core';
import { VisualisationDataService } from '../../visualisation-data.service';
import { InformationCarrier } from '../../../../../../model/infoCarrier';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Select } from '@ngxs/store';
import { CarriersState } from '../../../../../../state/information-carrier-state.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { VisualisationVerweis } from '../../../../../../model/visualisations';
import { VisualisationSettingsService } from '../../visualisation-settings.service';

@Component({
  selector: 'app-vis-data-interaction',
  templateUrl: './vis-data-interaction.component.html',
  styleUrl: './vis-data-interaction.component.scss',
})
export class VisDataInteractionComponent implements OnDestroy {
  carriersSub: Subscription;
  selectedCarriersSub: Subscription;
  lastSelectedCarrierSub: Subscription;
  selectedLinksSub: Subscription;

  @Select(CarriersState) carriers$!: Observable<InformationCarrier[]>;
  allCarriers: InformationCarrier[] = [];

  selectedCarriers: InformationCarrier[] = [];
  selectedCarrier: InformationCarrier | null = null;

  selectedCarrierInSelect: InformationCarrier | null = null;

  selectionApplied = false;

  // links

  selectedVerweise: VisualisationVerweis[] = [];

  constructor(
    private _visDataService: VisualisationDataService,
    private _visSettings: VisualisationSettingsService
  ) {
    this.carriersSub = this.carriers$.subscribe(
      (cars: InformationCarrier[]) => {
        this.allCarriers = cars.filter(
          (c) => c.has_incoming_verweis || c.has_outgoing_verweis
        );
      }
    );

    this.lastSelectedCarrierSub =
      this._visDataService.lastSelectedCarrier$.subscribe((carrier) => {
        this.selectedCarrier = carrier;
      });

    this.selectedCarriersSub = this._visDataService.selectedCarriers$.subscribe(
      (carriers: InformationCarrier[]) => {
        this.selectedCarriers = carriers;
      }
    );

    this.selectedLinksSub = this._visDataService.selectedVerweise$.subscribe(
      (verweise) => {
        this.selectedVerweise = verweise;
      }
    );
  }

  showAllNodes() {
    this.selectionApplied = false;
    this._visDataService.hideUnselectedCarriers(false);
  }

  applySelection() {
    this.selectionApplied = true;
    this._visDataService.hideUnselectedCarriers(true);
  }

  addCarrierToList() {
    if (this.selectedCarrierInSelect) {
      this._visDataService.selectCarrier(this.selectedCarrierInSelect);
    }
  }

  removeCarrierFromList(carrier: InformationCarrier) {
    this._visDataService.unselectCarrier(carrier);
  }

  toggleNodeSettings(event: MouseEvent, panel: MatExpansionPanel): void {
    event.stopPropagation(); // Prevent event from reaching the panel header
    panel.toggle(); // Programmatically toggle the panel
  }

  onSelectedInSelect(carrier: InformationCarrier) {
    if (this.isCarrieralreadyInList(carrier)) {
      this.selectedCarrier = null;
      return;
    }
    this.selectedCarrierInSelect = carrier;
    this.addCarrierToList();
  }

  isCarrieralreadyInList(carrier: InformationCarrier) {
    const idx = this.selectedCarriers.findIndex((c) => c.id === carrier.id);
    return idx > -1;
  }

  ngOnDestroy() {
    this.carriersSub.unsubscribe();
    this.selectedCarriersSub.unsubscribe();
    this.lastSelectedCarrierSub.unsubscribe();
    this.selectedLinksSub.unsubscribe();
  }
}
