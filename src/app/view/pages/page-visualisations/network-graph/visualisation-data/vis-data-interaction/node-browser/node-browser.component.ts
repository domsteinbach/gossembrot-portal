import { Component } from '@angular/core';
import { InformationCarrier } from '../../../../../../../model/infoCarrier';
import { VisualizationRepository } from '../../../../../../../data/repository/visualization-repository';
import { Observable } from 'rxjs';
import { InfoCarrierHitlistData } from '../../../../../../../data/repository-model';
import { VisualisationDataService } from '../../../visualisation-data.service';
import { NullCarrier } from '../../../../../../shared/steckbrief/steckbrief.component';
import { DisplayVerweis } from '../../../../../../../model/verweis';
import { BelegstelleRepository } from '../../../../../../../data/repository/belegstelle-repository';
import { UpdateSelectedPage } from '../../../../../../../state/app-state';
import { Store } from '@ngxs/store';
import {
  UpdateSelectedSrcInformationCarrier,
} from '../../../../../../../state/information-carrier-state.service';
import { CarrierText } from '../../../../../../../model/carriertext';

@Component({
  selector: 'app-node-browser',
  templateUrl: './node-browser.component.html',
  styleUrls: ['./node-browser.component.scss'],
})
export class NodeBrowserComponent {
  selectedCarrier: InformationCarrier | null = null;

  nullCarrier: NullCarrier = {
    title: 'Textträger auswählen',
    subTitle:
      'Durch Klick auf einen Knoten in der Visualisierung lassen sich Textträger auswählen, ' +
      'um deren Eigenschaften und Verweise hier anzuzeigen',
    description: '',
  };

  display: 'incoming' | 'outgoing' = 'incoming';

  infoCarrierHitlist$: Observable<InfoCarrierHitlistData>;

  selectedExistingCarrier!: InformationCarrier | null;
  selectedClassicCarrier!: InformationCarrier | null;
  selectedMissingCarrier!: InformationCarrier | null;

  activeTabIndex = 0;

  textsWithIncomingVerweise: CarrierText[] = [];

  constructor(
    private _br: BelegstelleRepository,
    private _store: Store,
    private vis_repository: VisualizationRepository,
    private _visDataService: VisualisationDataService,
  ) {
    this.infoCarrierHitlist$ = this.vis_repository.getInfoCarHitlist();
    // subscribe to the selected carrier
    this._visDataService.lastSelectedCarrier$.subscribe((carrier) => {
      this.setCarrier(carrier);
    });
  }

  setCarrier(carrier: InformationCarrier | null) {
    if (!carrier) {
      return;
    }
    this.selectedCarrier = carrier;
    this.selectedClassicCarrier =
      carrier?.physicality === 'Classic' ? this.selectedCarrier : null;
    this.selectedMissingCarrier =
      carrier?.physicality === 'Lost' ? this.selectedCarrier : null;
    this.selectedExistingCarrier =
      carrier?.physicality === 'Available' ? this.selectedCarrier : null;

    this._store.dispatch(new UpdateSelectedSrcInformationCarrier(carrier))
  }

  onIncomingVerweisClicked(verweis: DisplayVerweis) {
    this._visDataService.selectVerweis(verweis);
  }

  onVerweisSelected(verweis: DisplayVerweis | undefined): void {
    this._store.dispatch(new UpdateSelectedPage(verweis?.srcBelegstelleObj?.page));
  }

}
