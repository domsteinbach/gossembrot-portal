import { Injectable } from '@angular/core';
import { map, Observable, combineLatest, take, tap, of } from 'rxjs';
import { DataService } from '../dataservice.service';
import { DisplayVerweis } from '../../model/verweis';
import { Store } from '@ngxs/store';
import { CarriersState } from '../../state/information-carrier-state.service';
import { InformationCarrier } from '../../model/infoCarrier';

@Injectable({
  providedIn: 'root',
})
export class VerweisRepository {
  constructor(
    private _dataService: DataService,
    private _store: Store
  ) {
    this.verweise$().pipe(take(1)).subscribe(); // load all verweise initially
  }

  private _cachedVerweise: DisplayVerweis[] = [];

  getVerweisePointingToCarrier$(car_id: string): Observable<DisplayVerweis[]> {
    const verweise$ = this._cachedVerweise.length
      ? this._getVerweisePointingToCarrierCached$(car_id)
      : this._getVerweisePointingToCarrier$(car_id);

    const infoCars$: Observable<InformationCarrier[]> = this._store.select(CarriersState);

    return combineLatest([verweise$, infoCars$]).pipe(
      map(([verweise=[], carriers=[]]) =>
        verweise.map((v) => {
          v.srcCarObj = carriers.find((c) => c.id === v.srcCar);
          v.targetCarObj = carriers.find((c) => c.id === v.targetCar);
          return v;
        })
      )
    );
  }

  /***
   * get all outgoing Verweise from a given information carrier
   * @param car_id
   * @param includeErwaehnungen
   */
  outgoingVerweiseFromCarrier$(
    car_id: string,
    includeErwaehnungen = false
  ): Observable<DisplayVerweis[]> {
    const verweise$ = this._cachedVerweise.length
      ? this.verweise$().pipe(
        map((data) =>
          data.filter((v) => v.srcCar === car_id && (includeErwaehnungen || v.type !== 'Erwaehnung'))
        )
      )
      : this._getOutgoingVerweiseFromCarrier$(car_id).pipe(
        map((data) => data.filter((v) => includeErwaehnungen || v.type !== 'Erwaehnung'))
      );


    const infoCarriers$: Observable<InformationCarrier[]> = this._store.select(CarriersState);

    return combineLatest([verweise$, infoCarriers$]).pipe(
      map(([verweise, carriers]) =>
        verweise.map((v: DisplayVerweis) => {
          v.srcCarObj = carriers.find((c: InformationCarrier) => c.id === v.srcCar);
          v.targetCarObj = carriers.find((c: InformationCarrier) => c.id === v.targetCar);
          return v;
        })
      )
    );
  }

  verweise$(): Observable<DisplayVerweis[]> {
    if (!this._cachedVerweise.length) {
      return this._verweise$().pipe(
        tap((verweise) => {
          this._cachedVerweise = verweise
        })
      );
    }
    return of(this._cachedVerweise);
  }

  getVerweisById$(id: string): Observable<DisplayVerweis | null> {
    return this.getVerweiseByIds$([id]).pipe(
      map((verweise) => {
        return verweise.length ? verweise[0] : null;
      })
    );
  }

  getVerweiseByIds$(ids: string[] = []): Observable<DisplayVerweis[]> {
    if (!ids.length) {
      return of([]);
    }
    if (this._cachedVerweise.length) {
      const cachedVerweise = this._cachedVerweise.filter(v => ids.includes(v.id));
      return of(cachedVerweise);
    }

    const q = `SELECT * FROM verweis WHERE id IN (${ids.map(id => `'${id}'`).join(', ')}) ORDER BY id ASC`;
    return this._dataService.getDataAs$(DisplayVerweis,q);
  }

  getVerweiseOfSrcBelegstellen$(belegstellenIds: string[]): Observable<DisplayVerweis[]> {
    if (!belegstellenIds.length) {
      return of([]);
    }
    const q = `SELECT * FROM verweis WHERE src_belegstelle IN (${belegstellenIds.map(id => `'${id}'`).join(', ')}) ORDER BY id ASC`;
    return this._dataService.getDataAs$(DisplayVerweis, q);
  }

  private _getVerweisePointingToCarrierCached$(car_id: string): Observable<DisplayVerweis[]> {
    return this.verweise$().pipe(map((data) => {
      return data.filter((v) => v.targetCar === car_id);
    }));
  }

  private _verweise$(): Observable<DisplayVerweis[]> {
    const q = `SELECT * FROM verweis ORDER BY verweis.id ASC`;
    return this._dataService.getDataAs$(DisplayVerweis, q);
  }

  private _getOutgoingVerweiseFromCarrier$(car_id: string): Observable<DisplayVerweis[]> {
    const q = `SELECT * FROM verweis WHERE src_car = '${car_id}' ORDER BY id ASC`;
    return this._dataService.getDataAs$(DisplayVerweis, q);
  }

  private _getVerweisePointingToCarrier$(car_id: string): Observable<DisplayVerweis[]> {
    const q = `SELECT * FROM verweis WHERE target_car = '${car_id}' ORDER BY id ASC`;
    return this._dataService.getDataAs$(DisplayVerweis, q);
  }
}
