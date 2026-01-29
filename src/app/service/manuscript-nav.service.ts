import { combineLatest, distinctUntilChanged, Subject } from "rxjs";
import { BlindDoublePageFolio, Page } from "../model/page";
import {
  SelectedCarrierPagesState,
  SelectedPageState,
  UpdateDisplayedPages,
  UpdateSelectedPage,
} from "../state/app-state";
import { Store } from "@ngxs/store";
import { Injectable, OnDestroy } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { TileSourceService } from "./tile-source.service";

@Injectable({
  providedIn: "root",
})
export class ManuscriptNavService implements OnDestroy {
  private _pagesOfCarrier: Page[] = [];
  private _selectedPage!: Page;

  get selectedPage(): Page {
    return this._selectedPage;
  }

  private _doublePageView = true;
  private destroy$ = new Subject<void>();

  constructor(
    private _store: Store,
    private _tileSourceService: TileSourceService,
  ) {
    combineLatest([
      this._store.select(SelectedPageState).pipe(distinctUntilChanged()),
      this._store
        .select(SelectedCarrierPagesState)
        .pipe(distinctUntilChanged()),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([page, pages]) => {
        if (!pages.length || page?.carId !== pages[0]?.carId) {
          // if they don't match
          return;
        }

        if (
          page.id === this._selectedPage?.id &&
          pages[0].id === this._pagesOfCarrier[0].id
        ) {
          // if they are already set
          return;
        }

        this._selectedPage = page;
        this._pagesOfCarrier = pages;
        this.setDisplayedPages(page);
      });
  }

  private setDisplayedPages(selectedPage: Page) {
    const pages: Page[] = this.getDisplayedPages(selectedPage);
    this._store.dispatch(new UpdateDisplayedPages(pages));
    this._tileSourceService.updateTileSources(pages);
  }

  private getDisplayedPages(selectedPage: Page): Page[] {
    let displayedPages: Page[] = [selectedPage];
    if (!this._doublePageView || selectedPage.isDisplayedAsSingleImage) {
      return displayedPages;
    }
    let mod = 1;
    if (selectedPage.folio === "r") {
      mod = mod * -1; // verso must be displayed left of recto
    }

    const p = this._pagesOfCarrier.find((p) => p.idx == selectedPage.idx + mod);
    const secondaryPage = p
      ? p
      : new BlindDoublePageFolio(selectedPage.oppositeFolio);
    displayedPages.push(secondaryPage);
    // return the sorted array
    displayedPages = displayedPages.sort((a: Page, b: Page) => a.idx - b.idx);
    return displayedPages;
  }

  goToPage(idx: number) {
    const p = this._pagesOfCarrier.find((p) => p.idx === idx);
    if (!p) {
      throw new Error(`no page with idx ${idx} found`);
    }
    this._store.dispatch(new UpdateSelectedPage(p));
  }

  goNextPage() {
    if (this.isOnLastPage()) {
      return;
    }
    let mod = this._doublePageView ? 2 : 1;
    const nextP = this._pagesOfCarrier.find(
      (p) => p.idx === this._selectedPage.idx + 1,
    );
    if (
      (this._selectedPage.isDisplayedAsSingleImage && nextP?.folio === "v") ||
      nextP?.isDisplayedAsSingleImage
    ) {
      mod = 1;
    }
    this.goToPage(this._selectedPage.idx + mod);
  }

  goPrevPage() {
    if (this.isOnFirstPage()) {
      return;
    }
    let mod = this._selectedPage.idx === 1 ? 1 : this._doublePageView ? 2 : 1;

    const prevP = this._pagesOfCarrier.find(
      (p) => p.idx === this._selectedPage.idx - 1,
    );
    if (
      this._selectedPage.isDisplayedAsSingleImage ||
      prevP?.isDisplayedAsSingleImage
    ) {
      mod = 1;
    }
    this.goToPage(this._selectedPage.idx - mod);
  }

  isOnLastPage() {
    return (
      !this._selectedPage ||
      this._pagesOfCarrier.length - 1 === this._selectedPage.idx
    );
  }

  isOnFirstPage() {
    return this._selectedPage?.idx === 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
