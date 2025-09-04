import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  CarriersState,
  SelectedSrcInformationCarrierState,
  UpdateSelectedSrcInformationCarrier,
} from '../../../state/information-carrier-state.service';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, switchMap, take } from 'rxjs';
import { InformationCarrier } from '../../../model/infoCarrier';
import { Store } from '@ngxs/store';
import { ManuscriptNavService } from '../../../service/manuscript-nav.service';
import {
  DisplayedPagesState,
  DoubleTileSourcesState,
  LocalDoubleTileSourcesState,
  SelectedCarrierPagesState,
} from '../../../state/app-state';
import { GsmbTileSource, TileSourceService } from '../../../service/tile-source.service';
import { Page } from '../../../model/page';
import { PageRepository } from '../../../data/repository/page-repository';
import { color } from 'd3';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manuscript-compare',
  templateUrl: './manuscript-compare.component.html',
  styleUrl: './manuscript-compare.component.scss'
})
export class ManuscriptCompareComponent implements OnInit, OnDestroy {

  existingCarriers$ = this._store.select(CarriersState.existingManuscripts);

  selectedCarrier$: Observable<InformationCarrier> = this._store.select(SelectedSrcInformationCarrierState);
  displayedPages$: Observable<Page[]> = this._store.select(DisplayedPagesState);

  external$: Observable<GsmbTileSource[]> =  this._store.select(DoubleTileSourcesState);
  local$: Observable<GsmbTileSource[]> = this._store.select(LocalDoubleTileSourcesState);

  pagesOfCarrier$: Observable<Page[]> = this._store.select(SelectedCarrierPagesState);

  localPages$: Observable<Page[]> = this.pagesOfCarrier$.pipe(map((pages: Page[]) => pages.filter(page => page.imgDir && !page.imgDir.includes('missing_blatt'))));
  externalPages$: Observable<Page[]> = this.pagesOfCarrier$.pipe(map((pages: Page[]) => pages.filter(page => page.externalImgUrl)));
  externalIIIFPages$: Observable<Page[]> = this.pagesOfCarrier$.pipe(map((pages: Page[]) => pages.filter(page => page.iiifInfoUrl)));

  pagesWhichAreNotChecked$: Observable<Page[]> = this.pagesOfCarrier$.pipe(
    map((pages: Page[]) => pages.filter(page =>
      this.isNotCheckedPage(page))
    ));

  corruptedPages$: Observable<Page[]> = this.pagesOfCarrier$.pipe(map((pages: Page[]) => pages.filter(page => page.localImgIsCorrupt)));
  corruptedButManuallyFixedPages$: Observable<Page[]> = this.corruptedPages$.pipe(filter(pages => pages.some(page => page.manuallyAddedIiif)));


  allPages$: Observable<Page[]> = this._pr.allPages$();

  matchStatus$ = combineLatest([
    this.localPages$,
    this.externalIIIFPages$,
    this.externalPages$,
    this.pagesOfCarrier$
  ]).pipe(
    map(([local, iiif, external, carrierPages]) => {
      const l = local?.length ?? 0;
      const i = iiif?.length ?? 0;
      const e = external?.length ?? 0;
      const total = carrierPages?.length ?? 0;

      if (i === total || e === total) return 'ok';
      if ((i === l && l !== total) || (e === l && l !== total)) return 'ok';
      if (i > 0 && e === 0 && l === 0) return 'ok';
      if (e > 0 && i === 0 && l === 0) return 'ok';

      return 'fail';
    })
  );

  totalPagesLen = 0;
  totalLocalOnlyPages: Page[] = [];
  totalExternalPages: Page[] = [];  // IIIF as well as external images
  totalPagesToCheck = 0;

  carriersWithImagesToCheck$ = combineLatest([
    this.existingCarriers$,
    this.allPages$
  ]).pipe(
    take(1),
    map(([carriers, pages]) => {
      const localOnlyCarIds = new Set(
        pages.filter(page =>
          this.isNotCheckedPage(page))
          .map(page => page.carId)
      );

      return carriers.filter(c => localOnlyCarIds.has(c.id));
    })
  )


  // Carriers filter
  showOnlyToCheck$ = new BehaviorSubject<boolean>(false);
  filteredCarriers$ = this.showOnlyToCheck$.pipe(
    switchMap(showOnlyToCheck =>
      showOnlyToCheck ? this.carriersWithImagesToCheck$ : this.existingCarriers$
    ),
  );

  // pages filter
  showOnlyCorruptLocal$ = new BehaviorSubject<boolean>(false);
  showOnlyLowMatch$ = new BehaviorSubject<boolean>(false);
  showOnlyMissingExternal$ = new BehaviorSubject<boolean>(false);
  hideManuallyAdded$ = new BehaviorSubject<boolean>(false);

  isPagesFilterActive(): boolean {
      return this.showOnlyCorruptLocal$.getValue() || this.showOnlyLowMatch$.getValue() ||
        this.showOnlyMissingExternal$.getValue() || this.hideManuallyAdded$.getValue() ||
        this.showOnlyToCheck$.getValue();
  }

  filteredPagesOfCarrier$ = combineLatest([
    this.pagesOfCarrier$,
    this.showOnlyCorruptLocal$,
    this.showOnlyLowMatch$,
    this.showOnlyMissingExternal$,
    this.hideManuallyAdded$
  ]).pipe(
    map(([pages, onlyCorrupt, onlyLowMatch, onlyMissingExt, hideManuallyAdded]) => {
      return pages.filter(page => {
        if (onlyCorrupt && !page.localImgIsCorrupt) return false;
        if (onlyLowMatch && (!page.autocomparedIiif || page.matchPercentage >= 25)) return false;
        if (onlyMissingExt && (page.iiifInfoUrl || page.imgDir.includes('missing_blatt')) ) return false;
        if (hideManuallyAdded && (page.manuallyAddedIiif || page.iiifInfoUrl.startsWith('https://iiif.ub.unibe'))) return false;
        return true;
      });
    })
  );

  private _destroy$ = new Subject<void>();

  constructor(
    public manuscript: ManuscriptNavService,
    private _pr: PageRepository,
    private _store: Store,
    private _tileSource: TileSourceService) {
  }

  ngOnInit(): void {
    this._tileSource.debugMode.next(true);
    this.allPages$.pipe(take(1)).subscribe((pages) => {
      this.totalPagesLen = pages.length;
      this.totalLocalOnlyPages = pages.filter(page => page.imgDir && !page.externalImgUrl && !page.iiifInfoUrl && !page.imgDir.includes('missing_blatt'));
      this.totalExternalPages = pages.filter(page => page.externalImgUrl || page.iiifInfoUrl);
      this.totalPagesToCheck = pages.filter(page => this.isNotCheckedPage(page)).length;
    });

    this.filteredPagesOfCarrier$.pipe(takeUntil(this._destroy$)).subscribe(pages => {
      if (pages.length === 0 || !this.isPagesFilterActive()) {
        return;
      }
      if ( pages.map(p => p.id).includes(this.manuscript.selectedPage.id)) {
        return;
      } else { // go to the first page of the filtered pages
        this.manuscript.goToPage(pages[0].idx);
      }
    })
  }

  onShowOnlyLocalChanged(val: boolean): void {
    this.showOnlyToCheck$.next(val);
    if (val) {
      this.filteredCarriers$.pipe(take(1)).subscribe((carriers) => {
        if (carriers.length > 0) {
          this.onManuscriptSelectionChange(carriers[0]);
        }
      });
    }
  }

    onManuscriptSelectionChange(carrier: InformationCarrier): void {
    this._store.dispatch(new UpdateSelectedSrcInformationCarrier(carrier));
  }

  goPrevPage(): void {
    if (this.isPagesFilterActive()) {
      this.filteredPagesOfCarrier$.pipe(take(1)).subscribe((pages) => {
        if (pages.length > 0) {
          const currentPageIdx = pages.findIndex(page => page.id === this.manuscript.selectedPage.id);
          if (currentPageIdx > 0) {
            const pageToNavigate = pages[currentPageIdx - 1];
            this.manuscript.goToPage(pageToNavigate.idx);
          }

        }
      });
    } else {
      this.manuscript.goPrevPage();
    }
  }

  goNextPage(): void {
    if (this.isPagesFilterActive()) {
      this.filteredPagesOfCarrier$.pipe(take(1)).subscribe((pages) => {
        if (pages.length > 0) {
          const currentPageIdx = pages.findIndex(page => page.id === this.manuscript.selectedPage.id);
          if (currentPageIdx < pages.length - 1) {
            const pageToNavigate = pages[currentPageIdx + 1];
            this.manuscript.goToPage(pageToNavigate.idx);
          }
        }
      });
    } else {
      this.manuscript.goNextPage();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.manuscript.goPrevPage();
      // Prevent event propagation, so no other controls are infected
      event.stopPropagation();
    }
    if (event.key === 'ArrowRight') {
      this.manuscript.goNextPage();
      // Prevent event propagation, so no other controls are infected
      event.stopPropagation();
    }
  }

  toggleShowOnlyToCheck(event: Event) {
    const input = event.target as HTMLInputElement;
    this.showOnlyToCheck$.next(input.checked);
  }

  isNotCheckedPage(page: Page): boolean {
    return (
      (!page.externalImgUrl && !page.iiifInfoUrl && !page.isMissingBlatt) ||
      (
        !!page.imgDir &&
        !!page.iiifInfoUrl &&
        page.matchPercentage < 25 &&
        !page.iiifInfoUrl.startsWith('https://iiif.ub.unibe.ch') &&
        !page.manuallyAddedIiif &&
        !page.isMissingBlatt

      )
    );
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    this._tileSource.debugMode.next(false);
  }

  protected readonly color = color;
}
