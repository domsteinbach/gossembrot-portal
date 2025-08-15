import { Injectable } from '@angular/core';
import { combineLatest, defaultIfEmpty, map, Observable, tap } from 'rxjs';
import { DataService } from '../dataservice.service';
import {
  VisualisationVerweisData,
  InfoCarrierHitlistData,
  VisualisationNodeLinkData,
  CarrierTextData,
} from '../repository-model';
import {
  VisualisationNodeLink,
  VisualisationVerweis,
} from '../../model/visualisations';
import { CarrierText } from '../../model/carriertext';
import { AuthorRepository } from './author-repository';

@Injectable({
  providedIn: 'root',
})
export class VisualizationRepository {
  constructor(
    private _dataService: DataService,
    private authorRepo: AuthorRepository
  ) {}

  getCarrierToCarrierVerweise(): Observable<VisualisationVerweis[]> {
    return this._getCarrierToCarrierVerweisData().pipe(
      map((data: VisualisationVerweisData) => {
        if (Array.isArray(data)) {
          return data.map((item) => new VisualisationVerweis(item));
        } else {
          return [new VisualisationVerweis(data)];
        }
      }),
      defaultIfEmpty([]) // Ensure never null
    );
  }

  private _getCarrierToCarrierVerweisData(): Observable<VisualisationVerweisData> {
    const q = `SELECT 
        info_carrier.id AS 'src_id',
        info_carrier.title AS 'src_title',
        '' as 'src_parent',
        target_car.id AS 'target_id',
        target_car.title AS 'target_title',
        '' as 'target_parent',
        COUNT(verweis.id) AS 'number_of_verweise'
        FROM verweis
        LEFT JOIN info_carrier ON info_carrier.id = verweis.src_car
        LEFT JOIN info_carrier AS target_car ON target_car.id = verweis.target_car
        WHERE verweis.type = 0 AND verweis.src_car != verweis.target_car AND verweis.insecurity <= 1
        GROUP BY verweis.src_car, verweis.target_car
        `;
    return this._dataService.getData<VisualisationVerweisData>(q);
  }

  getInfoCarHitlist(): Observable<InfoCarrierHitlistData> {
    const q = `SELECT * FROM info_carrier_hitlist`;
    return this._dataService.getData<InfoCarrierHitlistData>(q);
  }

  getTextToTextVerweise(): Observable<VisualisationVerweis[]> {
    return this._getDistinctTextToTextVerweisData().pipe(
      map((data: VisualisationVerweisData) => {
        if (Array.isArray(data)) {
          return data.map((item) => new VisualisationVerweis(item));
        } else {
          return [new VisualisationVerweis(data)];
        }
      }),
      defaultIfEmpty([]) // Ensure never null
    );
  }

  private _getDistinctTextToTextVerweisData(): Observable<VisualisationVerweisData> {
    const q = `SELECT
    ROW_NUMBER() OVER (ORDER BY src_text.id, target_text.id) AS row_index,
    src_text.id AS src_id,
    src_text.title AS src_title,
    src_text.car_id as src_parent,
    target_text.id AS target_id,
    target_text.title AS target_title,
    target_text.car_id AS target_parent,
    COUNT(verweis.id) AS number_of_verweise
FROM verweis
INNER JOIN carrier_text as src_text ON src_text.id = verweis.src_text
INNER JOIN carrier_text AS target_text ON target_text.id = verweis.target_text
WHERE verweis.src_text IS NOT NULL 
AND verweis.target_text IS NOT NULL
AND verweis.type = 0 
AND verweis.src_car != verweis.target_car 
AND verweis.insecurity <= 1
GROUP BY verweis.src_text, verweis.target_text, src_text.id, src_text.title, target_text.id, target_text.title;
        `;
    return this._dataService.getData<VisualisationVerweisData>(q);
  }

  // get all texts which have a verweis - any. merge in the authors.
  getTextsHavingAVerweis$(): Observable<CarrierText[]> {
    return combineLatest([
      this._getAllTextsHavingAVerweisData$(),
      this.authorRepo.authors$(),
    ]).pipe(
      map(([texts, authors]) => {
        if (Array.isArray(texts)) {
          return texts.map(
            (item) => {
              const t =  new CarrierText(item)
              t.author = authors.find((a) => a.id === item.author_id);
              return t;
            }
          );
        } else {
          return [
            new CarrierText(
              texts,
            ),
          ];
        }
      }),
      defaultIfEmpty([]) // Ensure never null
    );
  }

  // get simply all texts which have a verweis - any.
  private _getTextsHavingAVerweis(): Observable<CarrierText[]> {
    return this._getAllTextsHavingAVerweisData$().pipe(
      map((data: CarrierTextData) => {
        if (Array.isArray(data)) {
          return data.map((item) => new CarrierText(item));
        } else {
          return [new CarrierText(data)];
        }
      }),
      defaultIfEmpty([]) // Ensure never null
    );
  }

  // get all the links between carriers and texts which have a
  // verweis
  // Optional white list of carriers.
  getTextToCarrierLinks(): Observable<VisualisationNodeLink[]> {
    return this._getLinksBetweenCarriersAndTextsNodeData().pipe(
      map((data: VisualisationNodeLinkData) => {
        if (Array.isArray(data)) {
          return data.map((item) => new VisualisationNodeLink(item));
        } else {
          return [new VisualisationNodeLink(data)];
        }
      }),
      defaultIfEmpty([]) // Ensure never null
    );
  }

  // get all the links between belegstellen and texts which have a
  // verweis
  // Optional white list of carriers.
  getBelegstelleNodeLinks(
    sourceCarriers: string[] = [],
    targetCarriers: string[] = []
  ): Observable<VisualisationNodeLink[]> {
    return this._getBelegstellenNodeLinkData$(
      sourceCarriers,
      targetCarriers
    ).pipe(
      map((data: VisualisationNodeLinkData) => {
        if (Array.isArray(data)) {
          return data.map((item) => new VisualisationNodeLink(item));
        } else {
          return [new VisualisationNodeLink(data)];
        }
      }),
      defaultIfEmpty([]) // Ensure never null
    );
  }

  // get all the links between nodes which are NOT a verweis, i.e. the links between carriers and texts which have a
  // verweis
  // Optional white list of carriers.
  private _getLinksBetweenCarriersAndTextsNodeData(): Observable<VisualisationNodeLinkData> {
    const q = `
SELECT DISTINCT
    src_car AS source,
    0 AS source_type,
    src_text AS target,
    1 AS target_type
FROM
    verweis
WHERE
    verweis.src_text IS NOT NULL
    AND verweis.type = 0 -- no "Erwaehnung"
UNION
SELECT DISTINCT
    target_car AS source,
    0 AS source_type,
    target_text AS target,
    1 AS target_type
FROM
    verweis
WHERE
    verweis.type = 0 -- no "Erwaehnung"
    AND verweis.target_text IS NOT NULL`;
    return this._dataService.getData<VisualisationNodeLinkData>(q);
  }

  // get all node links between belegstellen and Texts, which have a verweis.
  private _getBelegstellenNodeLinkData$(
    sourceCarriers: string[] = [],
    targetCarriers: string[] = []
  ): Observable<VisualisationNodeLinkData> {
    const sourcesClause =
      sourceCarriers.length > 0
        ? `scr_car IN (${sourceCarriers.join(',')}) AND`
        : '';
    const targetClause =
      targetCarriers.length > 0
        ? `target_car IN (${targetCarriers.join(',')}) AND`
        : '';

    const q = `
SELECT DISTINCT
    src_text AS source,
    1 AS source_type,
    src_belegstelle AS target,
    2 AS target_type
FROM
    verweis
WHERE
    ${sourcesClause}
    verweis.src_text IS NOT NULL
    AND verweis.src_belegstelle IS NOT NULL
    AND verweis.type = 0 -- no Erwaehnung
UNION
SELECT DISTINCT
    target_text AS source,
    1 AS source_type,
    target_belegstelle AS target,
    2 AS target_type
FROM
    verweis
WHERE
     ${targetClause}
    verweis.target_text IS NOT NULL
    AND verweis.target_belegstelle IS NOT NULL
    AND verweis.type = 0 -- no "Erwähnung";
    ;`;
    return this._dataService.getData<VisualisationNodeLinkData>(q);
  }

  // get all ndoe links between belegstellen and Texts, which have a verweis.
  private _getAllTextsHavingAVerweisData$(): Observable<CarrierTextData> {
    const q = `SELECT * FROM text_with_verweis;`;
    return this._dataService.getData<CarrierTextData>(q);
  }
}
