import { SearchResult, SearchResultTable } from '../../model/search-result';
import { Observable } from 'rxjs';
import { DataService } from '../dataservice.service';
import { Injectable } from '@angular/core';

export type SearchType = 'unset' |'fullWord' | 'prefix' | 'suffix';

@Injectable({ providedIn: 'root' })
export class SearchDataRepository {
  constructor(private _dataService: DataService) {}

  fullTextSearch$(
    searchTerms: string[] | string,
    searchType: SearchType,
    types: SearchResultTable[] = [],
    limit?: number,
  ): Observable<SearchResult[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const typesClause = types.length ? `AND type IN (${types.map(t => `'${t}'`).join(', ')})` : '';

    const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];

    let sqlClause = '';

    switch (searchType) {
      case 'fullWord':
        sqlClause = `MATCH(search_string) AGAINST('${terms.map(t => `+${t}`).join(' ')}' IN BOOLEAN MODE)`;
        break;

      case 'prefix':
        sqlClause = `MATCH(search_string) AGAINST('${terms.map(t => `${t}*`).join(' OR ')}' IN BOOLEAN MODE)`;
        break;

      case 'suffix':
        sqlClause = `(${terms.map(t => `search_string LIKE '%${t}'`).join(' OR ')})`;
        break;

      case 'unset':
        sqlClause = `(${terms.map(t => `search_string LIKE '%${t}%'`).join(' OR ')})`;
    }

    const q = `
      SELECT *
      FROM search_index
      WHERE ${sqlClause}
      ${typesClause}
      ORDER BY type, label
      ${limitClause};
    `;

    return this._dataService.getDataAs$(SearchResult, q);
  }
}
