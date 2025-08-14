import { Observable, shareReplay, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataService } from '../dataservice.service';
import {
  ExternalEntity,
} from '../../model/external_entity';

@Injectable({
  providedIn: 'root',
})
export class ExternalEntityRepository {

  private _cachedExternalEntities: ExternalEntity[] = [];
  private _cachedExternalEntities$: Observable<ExternalEntity[]> | undefined;

  constructor(private _dataService: DataService) {}

  getExternalEntities$(): Observable<ExternalEntity[]> {
    if (this._cachedExternalEntities.length && this._cachedExternalEntities$) {
      return this._cachedExternalEntities$;
    }

    this._cachedExternalEntities$ = this._getExternalEntities$().pipe(
      tap(ebd => this._cachedExternalEntities = ebd),
      shareReplay(1)
    );

    return this._cachedExternalEntities$;
  }

  private _getExternalEntities$(): Observable<ExternalEntity[]> {
    return this._dataService.getDataAs$(ExternalEntity);
  }
}
