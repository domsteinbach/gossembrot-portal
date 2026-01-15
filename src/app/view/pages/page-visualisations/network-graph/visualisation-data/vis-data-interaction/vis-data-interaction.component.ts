import { Component, OnDestroy } from '@angular/core';
import { VisualisationDataService } from '../../visualisation-data.service';
import { InformationCarrier } from '../../../../../../model/infoCarrier';
import { Select } from '@ngxs/store';
import { CarriersState } from '../../../../../../state/information-carrier-state.service';
import { Observable, Subscription } from 'rxjs';
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

  selectedVerweise: VisualisationVerweis[] = [];

  constructor(
    private _visDataService: VisualisationDataService,
    private _visSettings: VisualisationSettingsService
  ) {
    this.carriersSub = this.carriers$.subscribe(
      (cars: InformationCarrier[]) => {
        this.allCarriers = cars.filter(
          (c) => c.hasIncomingVerweis || c.hasOutgoingVerweis
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

  onFilterPanelOpened() {
    this._visDataService.setInteractionMode('select');
  }

  onFilterPanelClosed() {
    this._visDataService.setInteractionMode('info');
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
