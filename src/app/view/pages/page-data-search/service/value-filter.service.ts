import { Injectable } from '@angular/core';
import { Column, NullFilter, TableName } from '../data-search-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ValueFilterService {

  private _activeFiltersPerTable: Map<TableName, Map<Column, string>> = new Map<TableName, Map<Column, string>>();

  private _activeNullFiltersPerTable: Map<TableName, NullFilter[]> = new Map<TableName, NullFilter[]>();

  private _activeNullFiltersSubject = new BehaviorSubject<Map<TableName, NullFilter[]>>(new Map<TableName, NullFilter[]>());
  activeNullFilters$ = this._activeNullFiltersSubject.asObservable();

  getMultiFilterPredicate<T extends Record<string, Column>>(keysToSkip: (keyof T)[] = []) {
    return (data: T, filter: string): boolean => {
      const filters = JSON.parse(filter);

      return (Object.keys(filters) as (keyof T)[]).every((key) => {
        if (keysToSkip.includes(key)) return true; // Skip the specified keys

        const filterValue = filters[key as string];
        const dataValue = data[key] ? data[key]?.toString().toLowerCase() : '';
        return filterValue ? dataValue.includes(filterValue.toLowerCase()) : true;
      });
    };
  }

  updateStringContentFilters(tableName: TableName, column: Column, inputValue: string): string {
    const filters = this._activeFiltersPerTable.get(tableName) || new Map<Column, string>();
    filters.set(column, inputValue);
    this._activeFiltersPerTable.set(tableName, filters);
    const filterObject = Object.fromEntries(filters);
    return JSON.stringify(filterObject);
  }

  updateNullFilter(tableName: TableName, nullFilter: NullFilter) {
    const nullFilters = this._activeNullFiltersPerTable.get(tableName) || [];
    const index = nullFilters.findIndex((nf) => nf.column.column === nullFilter.column.column);
    if (index !== -1) {
      nullFilters[index] = nullFilter;
    } else {
      nullFilters.push(nullFilter);
    }
    this._activeNullFiltersPerTable.set(tableName, nullFilters);
    this._activeNullFiltersSubject.next(this._activeNullFiltersPerTable);
  }

  nullFilters$(tableName: TableName): Observable<NullFilter[]> {
    return this.activeNullFilters$.pipe(
      map((nullFilters) => nullFilters.get(tableName) || [])
    );
  }

  applyNullFilters<T>(
    data: T[],
    tableName: TableName
  ): T[] {
    const nullFilters = this._activeNullFiltersPerTable.get(tableName);
    if (!nullFilters) {
      return data;
    }
    return data.filter((entry) => this._filterByNullFilters(entry, nullFilters));
  }

  private _filterByNullFilters<T>(entry: T, nullFilters: NullFilter[]): boolean {

    return nullFilters.every((nullFilter) => {
      let columnValue = (entry as any)[nullFilter.column.column];
      if (nullFilter.column.column.includes('.')) {
        const keys = nullFilter.column.column.split('.');
        columnValue = (entry as any)[keys[0]]?.[keys[1]] || '';
      }
      if (!columnValue) {
        return nullFilter.showNullValues;
      } else {
        return nullFilter.showNonNullValues;
      }
    });
  }
}
