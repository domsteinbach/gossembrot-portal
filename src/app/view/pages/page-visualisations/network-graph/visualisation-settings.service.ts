import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VisGlobalFilter } from './visualisation-data/vis-data-interaction/vis-global-filters/vis-global-filters.component';

export type Granularity =
  | 'InformationCarrier'
  | 'CarrierAndText'
  | 'CarrierText'
  | 'Belegstelle';

@Injectable({
  providedIn: 'root',
})
export class VisualisationSettingsService {
  defaultGranularity: Granularity = 'InformationCarrier';
  defaultGlobalFilter: VisGlobalFilter = {
    inGsmbBib: [true, false],
    infoCarrierTypes: ['Manuscript', 'Print', 'Classic'],
    physicalities: ['Available', 'Lost', 'Classic'],
    includeConnected: true,
  };

  private _granularitySubject: BehaviorSubject<Granularity> =
    new BehaviorSubject<Granularity>(this.defaultGranularity);
  public granularity$: Observable<Granularity> =
    this._granularitySubject.asObservable();

  set granularity(value: Granularity) {
    this._granularitySubject.next(value);
  }

  private _globalFilterSubject: BehaviorSubject<VisGlobalFilter> =
    new BehaviorSubject(this.defaultGlobalFilter);
  public globalFilter$: Observable<VisGlobalFilter> =
    this._globalFilterSubject.asObservable();

  set globalFilter(value: VisGlobalFilter) {
    this._globalFilterSubject.next(value);
  }
}
