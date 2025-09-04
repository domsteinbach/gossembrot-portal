import { Injectable } from '@angular/core';
import { combineLatest, filter, map, Observable, of, shareReplay, switchMap, take, tap } from 'rxjs';
import { DataService } from '../dataservice.service';
import { Belegstelle } from '../../model/belegstelle';
import { VerweisRepository } from './verweis-repository';
import { Page } from '../../model/page';
import { PageRepository } from './page-repository';
import { Store } from '@ngxs/store';
import { SelectedCarrierPagesState } from '../../state/app-state';

@Injectable({
  providedIn: 'root',
})
export class BelegstelleRepository {
  constructor(
    private _dataService: DataService,
    private _pr: PageRepository,
    private _store: Store,
    private _vr: VerweisRepository) {}

  private _cachedBelegstellen : Belegstelle[] = [];
  private cachedBelegstellen$: Observable<Belegstelle[]> | undefined;

  private _belegStellen$ = this._dataService.getDataAs$(Belegstelle);

  /***
   * get all the Belegstellen of a given carrier from where a verweis goes out and points
   * to another instance, so source belegstellen, i.e. belegstellen with outgoing verweise only
   */
  srcBelegstellenOfSelectedSrcCarrier$(): Observable<Belegstelle[]> {
    const pages$ = this._store.select(SelectedCarrierPagesState); // Todo in visualisations: SELECT carrier in store and set stuff!

    return pages$.pipe(
      map((pages) => pages.length > 0 ? pages[0].carId : null), // Extract carrierId
      filter((carrierId): carrierId is string => !!carrierId), // Ensure it's not null
      switchMap((carrierId) =>
        combineLatest([
          this._belegstellenOfCarrier$(carrierId).pipe(
            map((belegstellen) =>
              belegstellen.filter((b) => b.isSource)
            )
          ),
          pages$ // Keep listening to pages$
        ])
      ),
      map(([belegstellen, pages]) => this._mergePagesIntoBelegstellen(belegstellen, pages))
    );
  }

  getSourceBelegstellenOfCarrier$(
    carrierId: string
  ): Observable<Belegstelle[]> {
    return this._belegstellenOfCarrierWithPages$(carrierId).pipe(
      map((belegstellen) => belegstellen.filter((b) => b.isSource))
    );
  }

  getTargetBelegstellenOfCarrier$(
    carrierId: string
  ): Observable<Belegstelle[]> {
    return this._belegstellenOfCarrierWithPages$(carrierId).pipe(
      map((belegstellen) => belegstellen.filter((b) => b.isTarget))
    );
  }

  getBelegStellenPointingToCarrier(
    carrierId: string
  ): Observable<Belegstelle[]> {

    const sources = this._belegstellenPointingToCarrier(carrierId);
    const pages$ = this._pr.pagesPointingToCarrier$(carrierId);

    return combineLatest([sources, pages$]).pipe(
      map(([belegstellen, pages]) => {
        return this._mergePagesIntoBelegstellen(belegstellen, pages);
      })
    );
  }

  /***
   * get all the Belegstellen a given carriers verweise are pointing to
   * @param carrierId
   */
  foreignTargetBelegstellenOfCarrier$(
    carrierId: string
  ): Observable<Belegstelle[]> {

    const targetBelegstellen$: Observable<Belegstelle[]> =
      this._getForeignTargetBelegstellenOfCarrier$(carrierId);

    const pages$: Observable<Page[]> =
      this._pr.pagesTargetedByCarriersVerweise$(carrierId);

    return combineLatest([targetBelegstellen$, pages$]).pipe(
      map(([belegstellen, pages]) => {
        return this._mergePagesIntoBelegstellen(belegstellen, pages);
      })
    );
  }

  belegstellen$(): Observable<Belegstelle[]> {
    return this._getAndPopulateCachedBelegstellen();
  }

  getBelegstellenWithTag(
    originalTag: string,
    limit?: number | null
  ): Observable<Belegstelle[]> {

    const limitClause = limit ? `LIMIT ${limit}` : '';
    const q = `SELECT * FROM belegstelle WHERE wortlaut LIKE '%<${originalTag}>%' or wortlaut LIKE '%<${originalTag}/>%' or wortlaut LIKE '%[${originalTag}]%' ORDER BY CHAR_LENGTH(wortlaut) ASC ${limitClause}`;

    return this._dataService.getDataAs$(Belegstelle, q);
  }


  private _mergePagesIntoBelegstellen(
    belegstellen: Belegstelle[],
    pages: Page[],
  ): Belegstelle[] {
    const pagesMap = new Map(pages.map((p) => [p.id, p]));
    belegstellen.forEach((b) => {
      const pageId = b.pageId ? b.pageId : b.alternativePageId || '';
      if (pagesMap.has(pageId)) {
        if (b.alternativePageId) {
          b.alternativePage = pagesMap.get(pageId) as Page;
        } else {
          b.page = pagesMap.get(pageId) as Page;
        }
      }
    });
    return belegstellen;
  }

  /***
   * get all source belegstellen pointing to a given target carrier.
   * @param car_id
   */
  private _belegstellenPointingToCarrier(
    car_id: string
  ): Observable<Belegstelle[]> {

    if (this._cachedBelegstellen.length) {
      return this._vr.getVerweisePointingToCarrier$(car_id).pipe(
        map((verweise) => {
          const belegstellen = this._cachedBelegstellen.filter((b) =>
            verweise.some((v) => v.srcBelegstelle === b.id)
          );
          return belegstellen;
        })
      );
    }

    this._getAndPopulateCachedBelegstellen().pipe(take(1)).subscribe();

    const q = `SELECT belegstelle.* FROM verweis
                    LEFT JOIN belegstelle ON belegstelle.id = verweis.src_belegstelle
                    WHERE verweis.target_car = '${car_id}';`;

    return this._dataService.getDataAs$(Belegstelle, q);
  }

  private _getAndPopulateCachedBelegstellen(): Observable<Belegstelle[]> {
    if (!this.cachedBelegstellen$) {
      this.cachedBelegstellen$ = this._belegStellen$.pipe(
        tap((belegstellen) => (this._cachedBelegstellen = belegstellen)),
        shareReplay(1)
      );
    }
    return this.cachedBelegstellen$;
  }

  private _belegstellenOfCarrierWithPages$(carId: string): Observable<Belegstelle[]> {
    return combineLatest([
      this._belegstellenOfCarrier$(carId),
      this._pr.pagesOfCarrierHavingBelegstellen$(carId)
    ]).pipe(
      map(([belegstellen, pages]) => this._mergePagesIntoBelegstellen(belegstellen, pages))
    );
  }

  private _belegstellenOfCarrier$(carId: string): Observable<Belegstelle[]> {

    if (this._cachedBelegstellen.length) {
      return of(this._cachedBelegstellen.filter((b) => b.carId === carId));
    } else { // populate and fallback to the database
        this._getAndPopulateCachedBelegstellen().pipe(take(1)).subscribe();
        return this._getBelegstellenOfCarrier(carId);
    }
  }

  /***
   * get all the target Belegstellen of the given carriers outgoing verweise are pointing to.
   * @param carrierId
   */
  private _getForeignTargetBelegstellenOfCarrier$(
    srcCarrierId: string
  ): Observable<Belegstelle[]> {
    const q = `SELECT DISTINCT belegstelle.* FROM verweis
                    LEFT JOIN belegstelle ON belegstelle.id = verweis.target_belegstelle
                    WHERE verweis.src_car = '${srcCarrierId}' and belegstelle.is_target = 1;`;

    return this._dataService.getDataAs$(Belegstelle, q);
  }

  /***
   * get all the Belegstellen of a given carrier - Belegstellen with outgoing Verweise as well as target Belegstellen.
   * @param carId
   */
  private _getBelegstellenOfCarrier(carId: string): Observable<Belegstelle[]> {
    const q = `SELECT belegstelle.* FROM belegstelle WHERE belegstelle.car_id = '${carId}'
                    ORDER BY sort_in_car;`;

    return this._dataService.getDataAs$(Belegstelle, q);
  }
}
