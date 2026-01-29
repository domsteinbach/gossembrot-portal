import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ManuscriptNavService } from "../../../../service/manuscript-nav.service";
import { Observable, Subject } from "rxjs";
import { Page } from "../../../../model/page";
import {
  SelectedCarrierPagesState,
  DisplayedPagesState,
} from "../../../../state/app-state";
import { Store } from "@ngxs/store";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-manuscript-nav",
  templateUrl: "./manuscript-nav.component.html",
  styleUrls: ["./manuscript-nav.component.scss"],
})
export class ManuscriptNavComponent implements OnInit, OnDestroy {
  @Input() hideVerweisSelect = false;
  @Input() hideTextSelect = false;

  private _destroy$ = new Subject<void>();

  pagesOfCarrier$: Observable<Page[]> = this._store.select(
    SelectedCarrierPagesState,
  );
  pages: Page[] = [];

  private _displayedPaged$: Observable<Page[]> =
    this._store.select(DisplayedPagesState);
  displayedPages!: Page[];

  constructor(
    public manuscript: ManuscriptNavService,
    public _store: Store,
  ) {}

  ngOnInit(): void {
    this._displayedPaged$.pipe(takeUntil(this._destroy$)).subscribe((pages) => {
      this.displayedPages = pages;
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
