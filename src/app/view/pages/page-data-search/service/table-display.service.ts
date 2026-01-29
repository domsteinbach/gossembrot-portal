import { Injectable } from "@angular/core";
import { ColumnDef, TableName } from "../data-search-types";
import { BehaviorSubject, Observable } from "rxjs";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { AuthService } from "../../../../auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class TableDisplayService {
  private _displayedColumns: Map<TableName, BehaviorSubject<ColumnDef[]>> =
    new Map<TableName, BehaviorSubject<ColumnDef[]>>();
  private _displayedFilters: Map<TableName, BehaviorSubject<ColumnDef[]>> =
    new Map<TableName, BehaviorSubject<ColumnDef[]>>();
  private _displayedNullFilters: Map<TableName, BehaviorSubject<ColumnDef[]>> =
    new Map<TableName, BehaviorSubject<ColumnDef[]>>();

  constructor(private _authService: AuthService) {}

  initTable(tableName: TableName, columns: ColumnDef[]) {
    if (!this._displayedColumns.has(tableName)) {
      // filter columns based on authService.isAuthenticated and isInternal property
      const filteredColumns = columns.filter((col) => {
        if (col.isInternal) {
          return this._authService.isAuthenticated();
        }
        return true;
      });

      this._displayedColumns.set(
        tableName,
        new BehaviorSubject<ColumnDef[]>(filteredColumns),
      );
      this._displayedFilters.set(
        tableName,
        new BehaviorSubject<ColumnDef[]>(
          filteredColumns.filter((col) => !col.customFilter),
        ),
      );
      this._displayedNullFilters.set(
        tableName,
        new BehaviorSubject<ColumnDef[]>(
          filteredColumns.filter((col) => col.nullOrEmptyFilter),
        ),
      );
    } else {
      console.warn(`Columns for table '${tableName}' are already initialized.`);
    }
  }

  getColumnsToDisplay$(tableName: TableName): Observable<ColumnDef[]> {
    const columnsSubject = this._displayedColumns.get(tableName);
    if (!columnsSubject) {
      throw new Error(`Table '${tableName}' is not initialized.`);
    }
    return columnsSubject.asObservable();
  }

  setColumnForTable(tableName: TableName, column: ColumnDef) {
    const columnsSubject = this._displayedColumns.get(tableName);

    if (columnsSubject) {
      const columns = columnsSubject.getValue(); // Get the current value
      const index = columns.findIndex((col) => col.column === column.column);

      if (index !== -1) {
        columns[index] = {
          ...columns[index],
          displayed: column.displayed,
          displayFilter: column.displayFilter,
        };
        columnsSubject.next(columns);
      }
    } else {
      console.warn(`Columns for table '${tableName}' are not initialized.`);
    }
  }

  getFiltersToDisplay$(tableName: TableName): Observable<ColumnDef[]> {
    const columnsSubject = this._displayedFilters.get(tableName);
    if (!columnsSubject) {
      throw new Error(`Table '${tableName}' is not initialized.`);
    }
    return columnsSubject.asObservable();
  }

  setDisplayedFilter(tableName: TableName, column: ColumnDef) {
    const columnsSubject = this._displayedFilters.get(tableName);

    if (columnsSubject) {
      const columns = columnsSubject.getValue();
      const index = columns.findIndex((col) => col.column === column.column);

      if (index !== -1) {
        columns[index] = {
          ...columns[index],
          displayFilter: column.displayFilter,
        };
        columnsSubject.next(columns);
      }
    } else {
      console.warn(`Columns for table '${tableName}' are not initialized.`);
    }
  }

  getNullFiltersToDisplay(tableName: TableName): ColumnDef[] {
    const columnsSubject = this._displayedNullFilters.get(tableName);
    if (!columnsSubject) {
      throw new Error(`Table '${tableName}' is not initialized.`);
    }
    return columnsSubject.getValue();
  }

  updatePaginatorTexts(intl: MatPaginatorIntl): MatPaginatorIntl {
    intl.itemsPerPageLabel = "Einträge pro Seite";
    intl.nextPageLabel = "Nächste Seite";
    intl.previousPageLabel = "Vorherige Seite";
    intl.firstPageLabel = "Erste Seite";
    intl.lastPageLabel = "Letzte Seite";
    intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 von ${length}`;
      }
      const startIndex = page * pageSize;
      const endIndex =
        startIndex < length
          ? Math.min(startIndex + pageSize, length)
          : startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} von ${length}`;
    };

    return intl;
  }
}
