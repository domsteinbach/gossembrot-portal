import { Component } from '@angular/core';
import { InformationCarrier, Physicality } from '../../../model/infoCarrier';
import { Store } from '@ngxs/store';
import { CarriersState } from '../../../state/information-carrier-state.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-page-classics',
  templateUrl: './page-classics.component.html',
  styleUrl: './page-classics.component.scss',
})
export class PageClassicsComponent {
  physicality: Physicality = 'Classic';
  title = "'Klassiker'";

  classics$ = this._store.select(CarriersState)
    .pipe(map(filter => filter.filter((carrier: InformationCarrier) => carrier.carrierType === 'Classic')));

  constructor(
    private _store: Store
    ) {
  }
}
