import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CarrierTextRepository } from '../../../../data/repository/carrier-text-repository';
import { ColumnDef } from '../data-search-types';
import { map, Observable, Subject, take } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { CarrierText, DisplayCarrierText } from '../../../../model/carriertext';
import { combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RouteConstants } from '../../../../routeConstants';
import { TableDisplayService } from '../service/table-display.service';
import { MatDialog } from '@angular/material/dialog';
import { ColumnSettingsComponent } from '../shared/column-settings/column-settings.component';
import { ValueFilterService } from '../service/value-filter.service';
import { MatDrawer } from '@angular/material/sidenav';
import { InfoCarrierRepository } from '../../../../data/repository/info-carrier-repository';
import { LinkService } from '../../page-manuscript/link.service';

@Component({
  selector: 'app-carrier-text-search',
  templateUrl: './carrier-text-search.component.html',
  styleUrls: [ '../page-data-search.component.scss'],
})
export class CarrierTextSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private readonly _initialColumns: ColumnDef[] = [
    {
      column: 'title',
      displayedName: 'Text/Abschnitt',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
    {
      column: 'cognomen',
      displayedName: 'Autor:in',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'authorGndId',
      displayedName: 'GND-ID (Autor:in)',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'carrierFulltitle',
      displayedName: 'Textträger',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
    {
      column: 'textRange',
      displayedName: 'Blattangabe',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },

  ] as const;

  @ViewChild('advancedFilterDrawer') advancedFilterDrawer: MatDrawer | undefined;

  isDrawerClosed = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns$: Observable<ColumnDef[]>;
  displayedColumns$: Observable<string[]>;

  loading = true;

  dataSource: MatTableDataSource<DisplayCarrierText> =
    new MatTableDataSource<DisplayCarrierText>();

  selectedRow: DisplayCarrierText | null = null;

  private _carrierTexts$ =
    combineLatest([this._getCarrierTexts$(), this._fs.nullFilters$('text')]).pipe(
      map(([texts, filters]) => this._fs.applyNullFilters<DisplayCarrierText>(texts, 'text'))
    );

  constructor(
    private _ds: TableDisplayService,
    private _fs: ValueFilterService,
    private _dialog: MatDialog,
    private _ls: LinkService,
    private _tr: CarrierTextRepository,) {

      this._ds.initTable('text',this._initialColumns);
      this.columns$ = this._ds.getColumnsToDisplay$('text');

      this.displayedColumns$ = this.columns$.pipe(
        map((columns) => columns.filter((c) => c.displayed).map((c) => c.column))
      );
  }

  ngOnInit(): void {
    this._carrierTexts$
      .pipe(takeUntil(this._destroy$))
      .subscribe((texts: DisplayCarrierText[]) => {
        this.dataSource.data = texts;
        this.loading = false;
      });

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this._fs.getMultiFilterPredicate<DisplayCarrierText>();
    this.paginator._intl = this._ds.updatePaginatorTexts(this.paginator._intl);
    this.paginator._intl.changes.next();
    this._setCustomSort();
    this.dataSource.sort = this.sort;
  }

  private _getCarrierTexts$(): Observable<DisplayCarrierText[]> {
    return this._tr.getCarrierTexts$().pipe(
      take(1),
      map((texts: DisplayCarrierText[]) =>
        texts
          .filter(text => text.title)
          .sort((a, b) =>
            (a.title?.toLowerCase() || '').localeCompare(b.title?.toLowerCase() || '')
          )
      )
    );
  }

  private _setCustomSort() {
    this.dataSource.sortingDataAccessor = (item: DisplayCarrierText, property) => {
      switch (property) {
        case 'textRange':
          return item.sortInCar;

        case 'gndId':
          return item.author?.gndId || '';

        default:
          return (item as any)[property].toLowerCase() || '';
      }
    };

    if (this.dataSource.sort) {
      this.dataSource.sort.direction = 'asc';
    }
  }

  onFilterChange(filters: string): void {
    this.dataSource.filter = filters;
  }

  selectRow(row: CarrierText): void {
    console.log(row);
  }

  toggleAdvancedFilterDrawer() {
    // Toggle the drawer
    this.advancedFilterDrawer?.toggle();
  }

  onDrawerStateChange(isOpened: boolean) {
    this.isDrawerClosed = !isOpened; // Set true when the drawer is closed
  }

  openTextInNewTab(text: DisplayCarrierText): void {
    this._ls.openTextInNewTab(text);
  }

  openColumnSettingsDialog() {
    this._dialog.open(ColumnSettingsComponent, {
      data: { tableName: 'text' }, // Pass the table name to the dialog
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
