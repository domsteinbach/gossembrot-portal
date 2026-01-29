import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  take,
  tap,
} from "rxjs";
import { Injectable } from "@angular/core";
import { CarrierTextData } from "../repository-model";
import { DataService } from "../dataservice.service";
import { CarrierText } from "../../model/carriertext";
import { AuthorRepository } from "./author-repository";
import { InfoCarrierRepository } from "./info-carrier-repository";

@Injectable({
  providedIn: "root",
})
export class CarrierTextRepository {
  private _cachedTexts: CarrierText[] = [];
  private _cachedTextsSub = new BehaviorSubject<CarrierText[]>([]);
  private _cachedTexts$ = this._cachedTextsSub.asObservable();

  constructor(
    private _dataService: DataService,
    private _ar: AuthorRepository,
    private _ir: InfoCarrierRepository,
  ) {}

  private _populateCachedTexts() {
    this._getCarrierTexts$()
      .pipe(take(1))
      .subscribe((texts: CarrierText[]) => {
        this._cachedTexts = texts;
        this._cachedTextsSub.next(texts);
      });
  }

  /***
   * get all display carrier texts of a given information carrier. Merge the texts with their authors.
   */
  getCarrierTextsOfCarrier$(carId: string): Observable<CarrierText[]> {
    if (!carId) {
      return of([]);
    }
    if (this._cachedTexts.length) {
      return this._cachedTexts$.pipe(
        map((texts) => texts.filter((t) => t.carId === carId)),
      );
    } else {
      this._populateCachedTexts();
    }
    return this._mapCarrierTextsWithAuthorsAndCarriers$(
      this._getCarrierTextsOfCarrier$([carId]),
    );
  }

  /***
   * get all target texts of a given source information carrier,
   * i.e. all texts onto which all verweise of a given information carrier are pointing to. Merge the texts with their authors.
   */
  getTargetTextsOfSrcCarrier$(carId: string): Observable<CarrierText[]> {
    const q = `SELECT DISTINCT
                    target_text.*
                    FROM verweis
                    LEFT JOIN info_carrier ON info_carrier.id = verweis.target_car
                    LEFT JOIN carrier_text AS src_text ON src_text.id = verweis.src_text
                    LEFT JOIN carrier_text AS target_text ON target_text.id = verweis.target_text
                    WHERE verweis.src_car = "${carId}" AND verweis.target_car IS NOT NULL AND target_text.id IS NOT NULL`;

    return this._mapCarrierTextsWithAuthorsAndCarriers$(
      this._dataService.getDataAs$(CarrierText, q),
    );
  }

  getCarrierTextsOfAuthors$(authorIds: string[]): Observable<CarrierText[]> {
    if (!authorIds.length) {
      return of([]);
    }
    if (this._cachedTexts.length) {
      return this._cachedTexts$.pipe(
        map((texts) => texts.filter((t) => authorIds.includes(t.authorId))),
      );
    } else {
      this._populateCachedTexts();
      return this._mapCarrierTextsWithAuthorsAndCarriers$(
        this._getCarrierTextsOfAuthors$(authorIds),
      );
    }
  }

  getCarrierTexts$(): Observable<CarrierText[]> {
    if (this._cachedTexts.length) {
      return this._cachedTexts$;
    }

    return this._getCarrierTexts$().pipe(
      tap((texts) => {
        this._cachedTexts = texts;
        this._cachedTextsSub.next(texts);
      }),
    );
  }

  getCarrierTextsByIds$(ids: string[]): Observable<CarrierText[]> {
    if (!ids.length) {
      return of([]);
    }
    if (this._cachedTexts.length) {
      return this._cachedTexts$.pipe(
        map((texts) => texts.filter((t) => ids.includes(t.id))),
      );
    } else {
      return this._mapCarrierTextsWithAuthorsAndCarriers$(
        this._getCarrierTextsByTextIds$(ids),
      );
    }
  }

  private _getCarrierTexts$(): Observable<CarrierText[]> {
    return this._mapCarrierTextsWithAuthorsAndCarriers$(
      this._dataService.getDataAs$(CarrierText),
    );
  }

  private _mapCarrierTextsWithAuthorsAndCarriers$(
    texts$: Observable<CarrierText[]>,
  ): Observable<CarrierText[]> {
    return combineLatest([
      texts$,
      this._ar.authors$(),
      this._ir.informationCarriers$(),
    ]).pipe(
      map(([texts, authors, carriers]) =>
        texts.map((text) => {
          text.author = authors.find((a) => a.id === text.authorId);
          text.carrier = carriers.find((c) => c.id === text.carId);
          return text;
        }),
      ),
    );
  }

  private _getCarrierTextsOfCarrier$(
    carriers: string[] = [],
  ): Observable<CarrierText[]> {
    const whereClause = carriers.length
      ? `WHERE car_id IN (${carriers.map((id) => `"${id}"`).join(",")})`
      : "";
    const q = `SELECT * FROM carrier_text ${whereClause} ORDER BY car_id, sort_in_car;`;

    return this._dataService.getDataAs$(CarrierText, q);
  }

  private _getCarrierTextsByTextIds$(
    textIds: string[],
  ): Observable<CarrierText[]> {
    if (!textIds.length) {
      return of([]);
    }

    const q = `SELECT * FROM carrier_text WHERE id IN (${textIds.map((id) => `"${id}"`).join(",")}) ORDER BY title`;
    return this._dataService.getDataAs$(CarrierText, q);
  }

  private _getCarrierTextsOfAuthors$(
    authorIds: string[],
  ): Observable<CarrierText[]> {
    const q = `SELECT * FROM carrier_text WHERE author_id IN (${authorIds.map((id) => `"${id}"`).join(",")}) 
                           ORDER BY title`;

    return this._dataService.getDataAs$(CarrierText, q);
  }

  createNullText(carrierId: string, sortInCar: number): CarrierText {
    const nullTextData: CarrierTextData = {
      author_id: "",
      cognomen: "",
      car_id: carrierId,
      is_lost: 0,
      id: "null",
      sort_in_car: sortInCar,
      title: "?",
      longTitle: "",
      text_range: "",
      incipit: "",
      additional_source: "",
      is_author_insecure: 0,
      first_page_id: "",
    };

    return new CarrierText(nullTextData);
  }
}
