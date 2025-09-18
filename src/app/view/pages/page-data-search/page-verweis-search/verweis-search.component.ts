import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { VerweisRepository } from '../../../../data/repository/verweis-repository';
import { DisplayVerweis } from '../../../../model/verweis';
import {
  combineLatest,
  map,
  Observable,
  switchMap,
  take,
} from 'rxjs';
import { Belegstelle } from '../../../../model/belegstelle';
import { BelegstelleRepository } from '../../../../data/repository/belegstelle-repository';
import { InformationCarrier } from '../../../../model/infoCarrier';
import { LinkService } from '../../page-manuscript/link.service';
import { VerweisAdvancedFilterService } from './verweis-advanced-filter.service';
import { XmlTransformService } from '../../../../service/xml-transform.service';
import { CarrierTextRepository } from '../../../../data/repository/carrier-text-repository';
import { ColumnDef } from '../data-search-types';
import { MatDialog } from '@angular/material/dialog';
import { ColumnSettingsComponent } from '../shared/column-settings/column-settings.component';
import { Store } from '@ngxs/store';
import { CarriersState } from '../../../../state/information-carrier-state.service';
import { CarrierText } from '../../../../model/carriertext';
import { TableDisplayService } from '../service/table-display.service';
import { ValueFilterService } from '../service/value-filter.service';
import { MatDrawer } from '@angular/material/sidenav';
import { SearchService } from '../../../../service/search-service.service';


@Component({
  selector: 'app-verweis-search',
  templateUrl: './verweis-search.component.html',
  styleUrls: ['verweis-search.component.scss','../page-data-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerweisSearchComponent implements OnInit, AfterViewInit {

  @ViewChild(MatTable) table!: MatTable<any>;

  columns$: Observable<ColumnDef[]>;
  displayedColumns$: Observable<string[]>;

  private readonly _initialColumns: ColumnDef[] = [
    {
      column: 'wortlaut',
      displayedName: 'Wortlaut',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      customFilter: true,
    },
    {
      column: 'srcBelegstelleText',
      displayedName: 'Belegstelle',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
    {
      column: 'srcTextAuthorCognomen',
      displayedName: 'Autor (Text)',
      primitiveType: 'string',
      displayed: false,
      displayFilter: false,
      nullOrEmptyFilter: true,
    },
    {
      column: 'srcTextTitle',
      displayedName: 'Text',
      primitiveType: 'string',
      displayed: false,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'targetCarFullTitle',
      displayedName: 'Ziel',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
    },
    {
      column: 'targetTextAuthorCognomen',
      displayedName: 'Autor (Zieltext)',
      primitiveType: 'string',
      displayed: false,
      displayFilter: false,
      nullOrEmptyFilter: true,
    },
    {
      column: 'targetTextTitle',
      displayedName: 'Zieltext',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'type',
      displayedName: 'Verweis-Typ',
      primitiveType: 'string',
      displayed: false,
      displayFilter: false,
    },
    {
      column: 'insecurity',
      displayedName: 'Priorität',
      primitiveType: 'number',
      displayed: false,
      displayFilter: false,
    },
    {
      column: 'targetBelegstelle',
      displayedName: 'Zielbelegstelle',
      primitiveType: 'string',
      displayed: true,
      displayFilter: true,
      nullOrEmptyFilter: true,
    },
    {
      column: 'alternativePageId',
      displayedName: 'alternatives Blatt',
      primitiveType: 'string',
      displayed: true,
      displayFilter: false,
    },
    {
      column: 'missingComment',
      displayedName: 'Kommentar zu fehlendem Blatt',
      primitiveType: 'string',
      displayed: true,
      displayFilter: false,
    },
    {
      column: 'bemerkungen',
      displayedName: 'Bemerkungen',
      primitiveType: 'string',
      displayed: true,
      displayFilter: false,
    },
  ] as const;

  dataSource: MatTableDataSource<DisplayVerweis> =
    new MatTableDataSource<DisplayVerweis>();
  private _allVerweise$: Observable<DisplayVerweis[]>;

  loading = true;

  stringsToHighlight: string[] = [];

  selectedRow: DisplayVerweis | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('advancedFilterDrawer') advancedFilterDrawer: MatDrawer | undefined;
  isDrawerClosed = true;

  private _infoCarrier$: Observable<InformationCarrier[]> =
    this._store.select(CarriersState);

  filters: any = {
    srcManuscript: '',
    author: '',
    text: '',
    wortlaut: '',
    targetManuscript: '',
    targetTextAuthor: '',
    targetText: '',
  };

  constructor(
    private _br: BelegstelleRepository,
    private _cdr: ChangeDetectorRef,
    private _ds: TableDisplayService,
    private _dialog: MatDialog,
    private _advancedFilterService: VerweisAdvancedFilterService,
    private _fs: ValueFilterService,
    private _store: Store,
    private _tr: CarrierTextRepository,
    private _vr: VerweisRepository,
    private _verweisLinkService: LinkService,
    private _xmlTransformService: XmlTransformService
  ) {

    this._ds.initTable('verweis', this._initialColumns);
    this.columns$ = this._ds.getColumnsToDisplay$('verweis');

    this._allVerweise$ = this._getVerweise$().pipe(take(1));
    this.displayedColumns$ = this.columns$.pipe(
      map((columns) => columns.filter((c) => c.displayed).map((c) => c.column))
    );
  }

  ngOnInit() {
    this.dataSource.filterPredicate = (data: DisplayVerweis, filter: string): boolean => {
      // skip the wortlaut filter from the generic filter predicate since it has a custom filter working with the wortlautSearchstring
      // and including the isophonems which the generic filter predicate does not know about
      const genericFilter = this._fs.getMultiFilterPredicate<DisplayVerweis>(['wortlaut'])(data, filter);
      const wortlautFilter = this._wortlautFilterPredicate()(data, filter);

      return genericFilter && wortlautFilter;
    };
  }

  ngAfterViewInit() {
    combineLatest([
      this._allVerweise$,
      this._advancedFilterService.targetPhysicalityFilter$,
      this._advancedFilterService.targetInfoCarrierTypeFilter$,
      this._advancedFilterService.targetBlattIsFragmentFilter$,
      this._advancedFilterService.targetBlattIsLostFilter$,
      this._advancedFilterService.isErwaehnungFilter$,
      this._fs.activeNullFilters$
    ])
      .pipe(
        switchMap(() => this._advancedFilterService.applyFilters(this._allVerweise$))
      )
      .subscribe((verweise: DisplayVerweis[] | null) => {
        if (verweise) {
          verweise = this._fs.applyNullFilters<DisplayVerweis>(verweise, 'verweis');
          // Set paginator and sort BEFORE setting the data to avoid rendering issues
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          this.loading = false;
          this.dataSource.data = verweise;

          this._cdr.detectChanges();

          this._setCustomSort();
        }
      });

    this.paginator._intl = this._ds.updatePaginatorTexts(this.paginator._intl);
    this.paginator._intl.changes.next();
  }

  private _getVerweise$(): Observable<DisplayVerweis[]> {
    const verweise$ = this._vr.verweise$();
    const belegstellen$: Observable<Belegstelle[]> =
      this._br.belegstellen$();
    const carrierTexts$ = this._tr.getCarrierTexts$();

    return combineLatest([
      verweise$,
      belegstellen$,
      this._infoCarrier$,
      carrierTexts$,
    ]).pipe(
      map(([verweise, belegstellen, carriers, texts]) => {
        return verweise.map((v) => {

          if (belegstellen && belegstellen.length > 0) {
            const targetBelegstelle = belegstellen.find(
              (b: Belegstelle) => b.id === v.targetBelegstelle
            );
            v.targetBelegstelleObj = targetBelegstelle;

            const srcBelegstelle = belegstellen.find(
              (b: Belegstelle) => b.id === v.srcBelegstelle
            );
            v.srcBelegstelleObj = srcBelegstelle;
          }
          if (carriers && carriers.length > 0) {
            const src_car = carriers.find((c: InformationCarrier) => c.id === v.srcCar);
            v.srcCarObj = src_car;

            const target_car = carriers.find((c: InformationCarrier) => c.id === v.targetCar);
            v.targetCarObj = target_car;
          }
          if (texts && texts.length > 0) {
            const targetText = texts.find((t: CarrierText) => t.id === v.targetText);
            v.targetTextObj = targetText;

            const srcText = texts.find((t: CarrierText) => t.id === v.srcText);
            v.srcTextObj = srcText;
          }

          return v; // Return the modified verweis object
        });
      })
    );
  }

  private _setCustomSort() {

    this.dataSource.sortingDataAccessor = (item: DisplayVerweis, property) => {
      if (property === 'srcBelegstelleText') {
        return item.sortArgForSrcBelegstelle.toLowerCase() || '';
      } else if (property === 'alternativePageId') {
        return item?.targetBelegstelleObj?.alternativePageId || '';
      } else {
        // default for all other columns
        return (item as any)[property].toLowerCase() || '';
      }
    };

    if (this.dataSource.sort) {
      this.dataSource.sort.direction = 'asc';
    }
  }

  applyWortlautFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value;
    filterValue = SearchService.removeIgnoredCharactersAndTags(filterValue).trim().toLowerCase();
    this.filters.wortlaut = filterValue;
    this.stringsToHighlight = SearchService.expandWithAlternativeWritings(filterValue);

    this._updateFilter();
  }

  onFilterChange(filters: string): void {
    const parsedFilters = JSON.parse(filters);
    this.filters = { ...this.filters, ...parsedFilters };
    this._updateFilter();
  }

  selectRow(row: DisplayVerweis) {
    if (this.selectedRow === row) {
      this.selectedRow = null;
    } else {
      this.selectedRow = row;
    }
  }

  private _wortlautFilterPredicate() {
    return (data: DisplayVerweis, activeFilters: string): boolean => {
      const filters = JSON.parse(activeFilters); // Parse the filters object

      return filters.wortlaut
        ? this._filterWortlaut(
            data.wortlautSearchstring || '',
            SearchService.expandWithAlternativeWritings(filters.wortlaut)
          )
        : true;
    };
  }

  _filterWortlaut(wortlautSearchString: string, filterValues: string[]): boolean {
    return filterValues.some((value) => wortlautSearchString.toLowerCase().includes(value));
  }

  _updateFilter() {
    this.dataSource.filter = JSON.stringify(this.filters);
  }

  toggleAdvancedFilterDrawer() {
    this.advancedFilterDrawer?.toggle();
  }

  onDrawerStateChange(isOpened: boolean) {
    this.isDrawerClosed = !isOpened; // Set true when the drawer is closed
  }

  openColumnSettingsDialog() {
    this._dialog.open(ColumnSettingsComponent, {
      data: { tableName: 'verweis' }, // Pass the table name to the dialog
    });
  }

  getWortlautFromHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  getWortlautFromTei(tei: string): string {
    return this.getWortlautFromHtml(
      this._xmlTransformService.transformXmlToHtml(tei)
    );
  }

  exportToCsv() {
    const csv = this.dataSource.filteredData.map((verweis: DisplayVerweis) => {
      return {
        Belegstelle: verweis.srcBelegstelleText || '',
        'Link zur Belegstelle':
          this._verweisLinkService.getSrcCarrierRoute(verweis) || '',
        Autor: verweis.srcTextObj?.author?.cognomen || '',
        Text: verweis.srcTextObj?.title || '',
        'Link zum Text': this._verweisLinkService.getSrcTextRoute(verweis) || '',
        Wortlaut: this.getWortlautFromTei(verweis.wortlautTeiXml) || '',
        Suchtext: verweis.wortlautSearchstring || '',
        TEIXml: verweis.wortlautTeiXml || '',
        Ziel: verweis.targetCarObj?.title || '',
        'Link zum Ziel':
          this._verweisLinkService.getReconstructedVerweisTargetRoute(verweis) || '',
        Zieltext: verweis.targetTextObj?.title || '',
        'Autor (Zieltext)': verweis.targetTextObj?.author?.cognomen || '',
      };
    });

    const csvData = this._convertToCSV(csv);
    const bom = '\uFEFF'; // UTF-8 BOM
    const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'verweise.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private _convertToCSV(objArray: any) {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str =
      'Belegstelle,Link zur Belegstelle,Autor,Text,Link zum Text,Wortlaut,Suchtext,TEIXml,Ziel,Link zum Ziel,Zieltext,Autor (Zieltext)\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line != '') line += ',';
        line += `"${array[i][index]}"`; // Wrap each field in quotes to handle commas
      }
      str += line + '\r\n';
    }
    return str;
  }

  protected readonly DisplayVerweis = DisplayVerweis;
}
