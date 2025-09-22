import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, map, Observable, Subject } from 'rxjs';
import { ColumnDef } from '../data-search-types';
import { MatDrawer } from '@angular/material/sidenav';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatTableDataSource,
} from '@angular/material/table';
import { Author } from '../../../../model/author';
import { AuthorRepository } from '../../../../data/repository/author-repository';
import { ColumnSettingsComponent } from '../shared/column-settings/column-settings.component';
import { TableDisplayService } from '../service/table-display.service';
import { ValueFilterService } from '../service/value-filter.service';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-page-author-search',
  standalone: false,
  templateUrl: './page-author-search.component.html',
  styleUrls: [ '../page-data-search.component.scss'],
})
export class AuthorSearchComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly _initialColumns: ColumnDef[] = [
    {
      column: 'cognomen',
      displayedName: 'Cognomen',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
    {
      column: 'gndId',
      displayedName: 'GND-ID',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,

    },
    {
      column: 'gndIdAlternate',
      displayedName: 'Alternative GND-ID',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'gndData.dateOfBirth',
      displayedName: 'Geburtsdatum',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    }
  ] as const;

  @ViewChild('advancedFilterDrawer') advancedFilterDrawer: MatDrawer | undefined;
  isDrawerClosed = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns$: Observable<ColumnDef[]>;
  displayedColumns$: Observable<string[]>;

  loading = true;

  dataSource: MatTableDataSource<Author>=
    new MatTableDataSource<Author>();

  selectedRow: Author | null = null;

  private _authors$ =
    combineLatest([this._ar.authors$(), this._fs.nullFilters$('author')]).pipe(
      map(([authors, filters]) => this._fs.applyNullFilters<Author>(authors, 'author'))
    );

  private _destroy$ = new Subject<void>();

  constructor(
    private _ar: AuthorRepository,
    private _ds: TableDisplayService,
    private _fs: ValueFilterService,
    private _dialog: MatDialog
  ) {

    this._ds.initTable('author',this._initialColumns);
    this.columns$ = this._ds.getColumnsToDisplay$('author');

    this.displayedColumns$ = this.columns$.pipe(
      map((columns) => columns.filter((c) => c.displayed).map((c) => c.column))
    );
  }

  ngOnInit() {
    this._authors$
      .pipe(
        takeUntil(this._destroy$))
      .subscribe((authors: Author[]) => {
        this.dataSource.data = authors.sort((a, b) => {
          if (a.cognomen.replace('(Ps.-)', '') < b.cognomen.replace('(Ps.-)', '')) {
            return -1;
          }
          if (a.cognomen.replace('(Ps.-)', '') > b.cognomen.replace('(Ps.-)', '')) {
            return 1;
          }
          return 0;
        });
        this.loading = false;
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this._fs.getMultiFilterPredicate<Author>();
    this.paginator._intl = this._ds.updatePaginatorTexts(this.paginator._intl);
    this.paginator._intl.changes.next();
    this.setCustomSort();
    this.dataSource.sort = this.sort;
  }

  setCustomSort() {
    this.dataSource.sortingDataAccessor = (item, property) => {

      switch (property) {
        case 'gndData.dateOfBirth':
          return (item as Author).gndData?.dateOfBirth?.replace("'", '').replace('[', '').toLowerCase() || '';
        default:
          return (item as any)[property].toLowerCase() || '';
      }
    };

    if (this.dataSource.sort) {
      this.dataSource.sort.direction = 'asc';
    }
  }

  selectRow(row: Author): void {
    console.log(row);
  }

  onFilterChange(filters: string): void {
    this.dataSource.filter = filters;
  }

  openColumnSettingsDialog() {
    this._dialog.open(ColumnSettingsComponent, {
      data: { tableName: 'author' },
    });
  }

  toggleAdvancedFilterDrawer() {
    this.advancedFilterDrawer?.toggle();
  }

  onDrawerStateChange(isOpened: boolean) {
    this.isDrawerClosed = !isOpened; // Set true when the drawer is closed
  }

  trackByDisplayedName(index: number, item: ColumnDef) {
    return item.displayedName;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
