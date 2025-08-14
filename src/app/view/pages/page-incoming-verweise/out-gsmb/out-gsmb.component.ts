import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { CarriersState } from '../../../../state/information-carrier-state.service';
import { InformationCarrier } from '../../../../model/infoCarrier';
import { map } from 'rxjs';

@Component({
  selector: 'app-out-gsmb',
  templateUrl: './out-gsmb.component.html',
  styleUrl: './out-gsmb.component.scss',
})
export class OutGsmbComponent {

  manuscriptsNotInGsmbLibrary$ = this._store.select(CarriersState).pipe(
    map(carriers => carriers.filter((carrier: InformationCarrier) => carrier.isLost && carrier.carrierType === 'Manuscript' && !carrier.inGsmbsLib))
  );

  constructor(
    private _store: Store
    ) {
  }
}
