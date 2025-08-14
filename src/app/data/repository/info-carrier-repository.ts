import { combineLatest, filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { InformationCarrier } from '../../model/infoCarrier';
import { DataService } from '../dataservice.service';
import { NamingGossembrot } from '../../model/naming-gsmb';
import { Library } from '../../model/library';
import { EinbandRepository } from './einband-repository';
import { ExternalEntityRepository } from './external-entity-repository';
import { Einband } from '../../model/einband';

@Injectable({
  providedIn: 'root',
})
export class InfoCarrierRepository {
  private _cachedCarriers: InformationCarrier[] = [];
  private cachedCarriers$: Observable<InformationCarrier[]> | undefined;

  private readonly _query = `
        SELECT info_carrier.*, has.has_incoming_verweis, has.has_outgoing_verweis FROM info_carrier
        LEFT JOIN carrier_has_verweis AS has ON has.id = info_carrier.id
        ORDER BY physicality, sig, title;`;

  private _infoCarriers$ = this._dataService.getDataAs$(InformationCarrier, this._query)
    .pipe(filter(c => c.length > 0));

  private _libraries$ = this._dataService.getDataAs$(Library)
    .pipe(filter(l => l.length > 0));

  private _namingsOfGossembrot$ = this._dataService.getDataAs$(NamingGossembrot)
    .pipe(filter(c => c.length > 0));

  constructor(
    private _dataService: DataService,
    private _ebr: EinbandRepository,
    private _extRepo: ExternalEntityRepository
  ) {}

  informationCarriers$(): Observable<InformationCarrier[]> {
    if (this._cachedCarriers.length && this.cachedCarriers$) {
      return of(this._cachedCarriers);
    }

    this.cachedCarriers$ = this._getInformationCarriersWithNamings$().pipe(
      tap(carriers => this._cachedCarriers = carriers)
    );

    return this.cachedCarriers$;
  }

  getCarrierById$(id: string): Observable<InformationCarrier | undefined> {
    if (this._cachedCarriers.length && this.cachedCarriers$) {
      return of(this._cachedCarriers.find(c => c.id === id));
    }

    return this.informationCarriers$().pipe(
      map(carriers => carriers.find(c => c.id === id))
    );
  }

  getCarrierByNamingGsmbId$(namingId: string): Observable<InformationCarrier | undefined> {
    return this.informationCarriers$().pipe(
      switchMap(carriers => {
        console.log('Searching for carrier with naming ID:', namingId);
        console.log('Searching for carrier with naming ID:', carriers);
        const foundCarrier = carriers.find(c => c.namingsGossembrot.some(n => n.id === namingId));
        return of(foundCarrier);
      })
    );
  }

  private _getInformationCarriersWithNamings$(): Observable<InformationCarrier[]> {
    return combineLatest([
      this._infoCarriers$,
      this._namingsOfGossembrot$,
      this._libraries$,
      this._ebr.getEinbaende$(),
      this._extRepo.getExternalEntities$()
    ]).pipe(
      map(([carriers, namings, libraries, einbaende, externalEntities]) => {
        carriers.forEach((c: InformationCarrier) => {
          c.namingsGossembrot = namings.filter(n => n.carId === c.id);
          c.library = libraries.find(lib => lib.id === c.libId);
          einbaende.forEach((e: Einband) => {
            if (e.carId === c.id) {
              e.externalEntity = externalEntities.find(ee => ee.objId === e.id && ee.objType === 'Einband');
            }
          });
          c.einbandInfo = einbaende.filter(e => e.carId === c.id);
          c.externalDigitalisat = externalEntities.find(ee => ee.objId === c.id && ee.objType === 'Digitalfaksimile');
          c.handschriftenPortal = externalEntities.find((ee) => ee.objId === c.id && ee.objType === 'Handschriftenportal');
          c.handschriftenCensus = externalEntities.find((ee) => ee.objId === c.id && ee.objType === 'Handschriftencensus');
        });
        return carriers;
      })
    );
  }
}
