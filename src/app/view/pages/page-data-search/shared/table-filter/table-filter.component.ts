import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { TableDisplayService } from '../../service/table-display.service';
import { map, Observable, of } from 'rxjs';
import { Column, ColumnDef, TableName } from '../../data-search-types';
import { ValueFilterService } from '../../service/value-filter.service';

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    NgForOf,
    NgIf,
  ],
  templateUrl: './table-filter.component.html',
  styleUrl: './table-filter.component.scss'
})
export class TableFilterComponent implements OnInit {

  @Input() tableName: TableName | undefined;
  @Output() filterChange = new EventEmitter<string>();

  displayedFilters$: Observable<ColumnDef[]> = of([]);
  displayedColumnFilters: ColumnDef[] = [];

  constructor(private _ds: TableDisplayService, private _fs: ValueFilterService) {
  }

  ngOnInit() {

    if (!this.tableName) {
      return;
    }

    this.displayedFilters$ = this._ds.getFiltersToDisplay$(this.tableName).pipe(
      map((columns) => columns.filter((c) => c.displayFilter))
    );

    this.displayedFilters$.subscribe((columnDefs: ColumnDef[]) => {
      this.onDisplayFilterChange(columnDefs);});
  }

  onDisplayFilterChange(newColumnDefs: ColumnDef[]): void {
    if (!this.tableName) {
      return;
    }
    const removedColumns = this.displayedColumnFilters.filter((c) => !newColumnDefs.includes(c));
    const addedColumns = newColumnDefs.filter((c) => !this.displayedColumnFilters.includes(c));

    if (removedColumns.length > 0) {
      const filters: string = this._fs.updateStringContentFilters(this.tableName, removedColumns[0].column, '');
      this.filterChange.emit(filters);
    }

    if (addedColumns.length > 0) {
      const filters: string = this._fs.updateStringContentFilters(this.tableName, addedColumns[0].column, '');
      this.filterChange.emit(filters);
    }
    this.displayedColumnFilters = newColumnDefs;
  }

  onValueChange(column: Column, event: KeyboardEvent): void {
    if (!this.tableName) {
      return;
    }
    const inputValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const filters: string = this._fs.updateStringContentFilters(this.tableName, column, inputValue);
    this.filterChange.emit(filters);
  }



}
