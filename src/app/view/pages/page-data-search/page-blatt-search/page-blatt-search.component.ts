import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, map, Observable, Subject, switchMap, take, tap } from 'rxjs';
import { ColumnDef } from '../data-search-types';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableDisplayService } from '../service/table-display.service';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { ColumnSettingsComponent } from '../shared/column-settings/column-settings.component';
import { Page } from '../../../../model/page';
import { PageRepository } from '../../../../data/repository/page-repository';
import { InformationCarrier } from '../../../../model/infoCarrier';
import { ValueFilterService } from '../service/value-filter.service';
import { MatDrawer } from '@angular/material/sidenav';
import { InfoCarrierRepository } from '../../../../data/repository/info-carrier-repository';

@Component({
  selector: 'app-page-blatt-search',
  templateUrl: './page-blatt-search.component.html',
  styleUrls: ['../page-data-search.component.scss', './page-blatt-search.component.scss'],
})
export class PageBlattSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private readonly _initialColumns: ColumnDef[] = [
    {
      column: 'idx',
      displayedName: 'Sortierung',
      primitiveType: 'number',
      displayed: true,
      displayFilter: false,
    },
    {
      column: 'label',
      displayedName: 'Blattangabe',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
    {
      column: 'lagenText',
      displayedName: 'Lage',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'doppellagenText',
      displayedName: 'Lagentext Doppelseite',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'pageType',
      displayedName: 'Typ',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
  ] as const;

  @ViewChild('advancedFilterDrawer') advancedFilterDrawer: MatDrawer | undefined;
  isDrawerClosed = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columns$: Observable<ColumnDef[]>;
  displayedColumns$: Observable<string[]>;

  loading = true;

  dataSource: MatTableDataSource<Page>=
    new MatTableDataSource<Page>();

  selectedRow: Page | null = null;

  private _infoCarriers$: Observable<InformationCarrier[]> =
    this._ir.informationCarriers$().pipe(map((carriers) => carriers.filter((c: InformationCarrier) => c.physicality === 'Available')));

  carriers: InformationCarrier[] = [];

  private _selectedCarrier: Subject<string> = new Subject<string>();
  private _selectedCarrier$ = this._selectedCarrier.asObservable();

  constructor(
    private _ds: TableDisplayService,
    private _fs: ValueFilterService,
    private _ir: InfoCarrierRepository,
    private _dialog: MatDialog,
    private _pr: PageRepository) {

    this._ds.initTable('page',this._initialColumns);
    this.columns$ = this._ds.getColumnsToDisplay$('page');

    this.displayedColumns$ = this.columns$.pipe(
      map((columns) => columns.filter((c) => c.displayed).map((c) => c.column))
    );
  }

  ngOnInit(): void {
    this._selectedCarrier$
      .pipe(
        takeUntil(this._destroy$),
        tap(() => this.loading = true),
        switchMap((carrier: string) =>
          this._getFilteredPages$(carrier).pipe(takeUntil(this._destroy$))
        ),
        tap(() => this.loading = false)
      )
      .subscribe((pages: Page[]) => {
        if (pages.length > 0) {
          this.loading = false;
          this.dataSource.data = pages;
        }
      });

    this._infoCarriers$.pipe(take(1)).subscribe((carriers: InformationCarrier[]) => {
      if (carriers.length > 0) {
        this.carriers = carriers;
        this._selectedCarrier.next(carriers[0].id);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this._fs.getMultiFilterPredicate<Page>();
    this.paginator._intl = this._ds.updatePaginatorTexts(this.paginator._intl);
    this.paginator._intl.changes.next();
    this.setCustomSort();
    this.dataSource.sort = this.sort;
  }

  private _getFilteredPages$(carrierId: string): Observable<Page[]> {
    return combineLatest([this._pr.pagesOfCarrier$(carrierId), this._fs.nullFilters$('page')]).pipe(
      map(([pages, _filters]) => this._fs.applyNullFilters<Page>(pages, 'page'))
    );
  }

  setCustomSort() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'idx':
          return (item as Page).idx || 0;
        default:
          return (item as any)[property].toLowerCase() || '';
      }
    };

    if (this.dataSource.sort) {
      this.dataSource.sort.direction = 'asc';
    }
  }

  selectRow(row: Page): void {
    console.log(row);
  }

  onFilterChange(filters: string): void {
    this.dataSource.filter = filters;
  }

  openColumnSettingsDialog() {
    this._dialog.open(ColumnSettingsComponent, {
      data: { tableName: 'page' },
    });
  }

  onCarrierSelectionChange(carrier: InformationCarrier): void {
    this._selectedCarrier.next(carrier.id);
  }

  toggleAdvancedFilterDrawer() {
    this.advancedFilterDrawer?.toggle();
  }

  onDrawerStateChange(isOpened: boolean) {
    this.isDrawerClosed = !isOpened; // Set true when the drawer is closed
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
