import { Observable, shareReplay, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataService } from '../dataservice.service';
import { Einband } from '../../model/einband';

@Injectable({
  providedIn: 'root',
})
export class EinbandRepository {

  _cachedEinbaende: Einband[] = [];
  cachedEinbaende$: Observable<Einband[]> | undefined;

  constructor(private _dataService: DataService) {
  }

  getEinbaende$(): Observable<Einband[]> {
    return this._getEinbaendeReplayed$();
  }

  private _getEinbaendeReplayed$(): Observable<Einband[]> {
    if (this._cachedEinbaende.length && this.cachedEinbaende$) {
      return this.cachedEinbaende$;
    }

    this.cachedEinbaende$ = this._getEinbaende$().pipe(
      tap(ebd => this._cachedEinbaende = ebd),
      shareReplay(1)
    );

    return this.cachedEinbaende$;
  }

  private _getEinbaende$(): Observable<Einband[]> {
    return this._dataService.getDataAs$(Einband);
  }
}

