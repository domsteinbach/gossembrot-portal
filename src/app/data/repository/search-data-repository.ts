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
      // ===== MySQL path (unchanged) =======================================
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
    // Use FTS for token/word modes; LIKE for substring modes.
    let sqliteWhere = '';
    if (searchType === 'fullWord') {
      // token AND token AND ... (default FTS behavior is AND between terms)
      // Wrap in quotes to avoid parsing operators in terms.
      const ftsQuery = terms.map(t => `"${t}"`).join(' ');
      sqliteWhere = `rowid IN (
        SELECT rowid FROM search_index_fts WHERE search_index_fts MATCH '${ftsQuery}'
      )`;
    } else if (searchType === 'prefix') {
      // token* OR token* ...
      const ftsQuery = terms.map(t => `${t}*`).join(' OR ');
      sqliteWhere = `rowid IN (
        SELECT rowid FROM search_index_fts WHERE search_index_fts MATCH '${ftsQuery}'
      )`;
    } else if (searchType === 'suffix') {
      sqliteWhere = `(${terms.map(t => `search_string LIKE '%${t}'`).join(' OR ')})`;
    } else { // 'unset' substring match
      sqliteWhere = `(${terms.map(t => `search_string LIKE '%${t}%'`).join(' OR ')})`;
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
