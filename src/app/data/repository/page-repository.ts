import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { Page } from '../../model/page';
import { DataService } from '../dataservice.service';

@Injectable({
  providedIn: 'root',
})
export class PageRepository {
  constructor(private _dataService: DataService) {}

  private _cachedPages: BehaviorSubject<Page[]> = new BehaviorSubject<Page[]>([]);
  private cachedPages$ = this._cachedPages.asObservable();

  /***
   * get all pages of a given information carrier.
   */
  pagesOfCarrier$(carId: string): Observable<Page[]> {
    const q = `SELECT * FROM page WHERE car_id = "${carId}"
               ORDER BY sort_in_car ASC;`;
    return this._dataService.getDataAs$(Page, q)
  }

  /***
   * get all pages of a given information carrier which have a belegstelle on it.
   */
  pagesOfCarrierHavingBelegstellen$(
    carId: string,
  ): Observable<Page[]> {

    const q = `
    SELECT DISTINCT page.*
    FROM belegstelle
    JOIN page ON page.id = belegstelle.page_id
    WHERE belegstelle.car_id = "${carId}"
    
    UNION
    
    SELECT DISTINCT page.*
    FROM belegstelle
    JOIN page ON page.id = belegstelle.alternative_page
    WHERE belegstelle.car_id = "${carId}"
    
    ORDER BY sort_in_car ASC;`;
    return this._dataService.getDataAs$(Page, q)
  }

  // get all pages from any information carrier which have a belegstelle/verweis on it pointing to the given carrier
  pagesPointingToCarrier$(carId: string): Observable<Page[]> {

    const q = `SELECT DISTINCT src_page.* FROM verweis
            LEFT JOIN belegstelle AS src_belegstelle ON src_belegstelle.id = verweis.src_belegstelle
            LEFT JOIN page as src_page ON src_page.id = src_belegstelle.page_id
            WHERE verweis.target_car = '${carId}' AND src_page.id IS NOT NULL;`;

    return this._dataService.getDataAs$(Page, q)
  }

  // get all pages of any information carrier to which the given carriers verweise are pointing to
  pagesTargetedByCarriersVerweise$(carId: string): Observable<Page[]> {
    const q = `SELECT DISTINCT target_page.* FROM verweis
            LEFT JOIN belegstelle AS target_belegstelle ON target_belegstelle.id = verweis.target_belegstelle
            LEFT JOIN page as target_page ON target_page.id = target_belegstelle.page_id or target_page.id = target_belegstelle.alternative_page
            WHERE verweis.src_car = '${carId}' AND target_page.id IS NOT NULL;`;
    return this._dataService.getDataAs$(Page, q);
  }

  allPages$(): Observable<Page[]> {
    if (this._cachedPages.getValue().length) {
      return this.cachedPages$;
    } else {
      return this._allPages$().pipe(
        tap((pages) => {
          this._cachedPages.next(pages);
        })
      );
    }
  }

  private _allPages$(): Observable<Page[]> {
    const q = `SELECT * FROM page ORDER BY sort_in_car ASC;`;
    return this._dataService.getDataAs$(Page, q);
  }
}
