import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Page } from "../../../../model/page";
import { ManuscriptNavService } from "../../../../service/manuscript-nav.service";
import { MatButton } from "@angular/material/button";
import { Observable, Subject } from "rxjs";
import { Select } from "@ngxs/store";
import { DisplayedPagesState } from "../../../../state/app-state";
import { MatDrawer } from "@angular/material/sidenav";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-manuscript-browser",
  templateUrl: "./manuscript-browser.component.html",
  styleUrls: ["./manuscript-browser.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManuscriptBrowserComponent implements OnInit, OnDestroy {
  @Select(DisplayedPagesState)
  private _displayedPages$!: Observable<Page[]>;

  private _destroy$ = new Subject<void>();

  displayedPages!: Page[];

  @ViewChild("rightDrawer") rightDrawer!: MatDrawer;
  @ViewChild("rippleOutgoingVerweiseBtn", { static: false })
  rippleOutgoingVerweiseBtn!: MatButton;

  constructor(public manuscript: ManuscriptNavService) {}

  ngOnInit() {
    // subscribe to the store for changes in displayed pages
    this._displayedPages$.pipe(takeUntil(this._destroy$)).subscribe((pages) => {
      this.displayedPages = pages;
    });
  }

  /***
   * onKeyDown catch arrow keystrokes and navigate accordingly. Arrow up/down navigates in texts.
   * Arrow left/right navigates in pages
   * @param event: a keyboard event
   */
  @HostListener("window:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "ArrowLeft") {
      this.manuscript.goPrevPage();
      // Prevent event propagation, so no other controls are infected
      event.stopPropagation();
    }
    if (event.key === "ArrowRight") {
      this.manuscript.goNextPage();
      // Prevent event propagation, so no other controls are infected
      event.stopPropagation();
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
