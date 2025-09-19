import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { DataService } from '../dataservice.service';
import { environment} from "../../../environments/environment";
import { SearchResult, SearchResultTable } from '../../model/search-result';

export type SearchType = 'unset' | 'fullWord' | 'prefix' | 'suffix';

@Injectable({ providedIn: 'root' })
export class SearchDataRepository {
  private useSqlite = environment.useSqlJs;

  constructor(private _data: DataService) {}

  fullTextSearch$(
      searchTerms: string[] | string,
      searchType: SearchType,
      types: SearchResultTable[] = [],
      limit?: number,
  ): Observable<SearchResult[]> {

    const terms = (Array.isArray(searchTerms) ? searchTerms : [searchTerms]).map(escapeSql);
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const typesClause = types.length ? `AND type IN (${types.map(t => `'${escapeSql(t)}'`).join(', ')})` : '';
    if (!this.useSqlite) {
      const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let sqlClause = '';
      switch (searchType) {
        case 'fullWord':
          sqlClause = '(' + terms
              .filter(Boolean)
              .map(t => `search_string REGEXP '[[:<:]]${esc(t)}[[:>:]]'`)
              .join(' OR ') + ')';
          break;

        case 'prefix':
          sqlClause = '(' + terms
              .filter(Boolean)
              .map(t => `search_string REGEXP '[[:<:]]${esc(t)}'`)
              .join(' OR ') + ')';
          break;

        case 'suffix':
          sqlClause = '(' + terms
              .filter(Boolean)
              .map(t => `search_string REGEXP '${esc(t)}[[:>:]]'`)
              .join(' OR ') + ')';
          break;
        case 'unset':
        default:
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
      return this._data.getDataAs$(SearchResult, q);
    }

    // ===== Static/sqlite path =============================================
    // escape only LIKE specials
    const likeEsc = (s: string) => s.replace(/([%_\\])/g, '\\$1');

// normalize: turn separators into '[', then add head+tail '['
    const tokenized = `('[' || REPLACE(REPLACE(REPLACE(REPLACE(search_string,' ','['),'-','['),'(','['),'|','[') || '[')`;

    let sqliteWhere = '';
    switch (searchType) {
      case 'fullWord':
        // token == term  ->  [%[term[%]
        sqliteWhere = `(${terms.map(t =>
            `${tokenized} LIKE '%[${likeEsc(t)}[%' ESCAPE '\\'`
        ).join(' OR ')})`;
        break;

      case 'prefix':
        // token starts with term  ->  [%[term%]
        sqliteWhere = `(${terms.map(t =>
            `${tokenized} LIKE '%[${likeEsc(t)}%' ESCAPE '\\'`
        ).join(' OR ')})`;
        break;

      case 'suffix':
        // token ends with term  ->  [%term[%]
        sqliteWhere = `(${terms.map(t =>
            `${tokenized} LIKE '%${likeEsc(t)}[%' ESCAPE '\\'`
        ).join(' OR ')})`;
        break;

      default: // substring within a token
        // token contains term anywhere  ->  [%[ %term% [%]
        sqliteWhere = `(${terms.map(t =>
            `${tokenized} LIKE '%[%' || '${likeEsc(t)}' || '%[%' ESCAPE '\\'`
        ).join(' OR ')})`;
    }

    const q = `
      SELECT id, search_string, label, type
      FROM search_index
      WHERE ${sqliteWhere}
        ${typesClause}
      ORDER BY type, label
        ${limitClause};
    `;
    return this._data.getDataAs$(SearchResult, q);
  }
}

function escapeSql(s: string): string {
  return String(s).replaceAll("'", "''");
}
