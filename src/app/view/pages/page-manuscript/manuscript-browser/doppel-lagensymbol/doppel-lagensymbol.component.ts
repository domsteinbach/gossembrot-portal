import { Component, OnDestroy } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { map, Observable, Subject } from "rxjs";
import { Page } from "../../../../../model/page";
import { DisplayedPagesState } from "../../../../../state/app-state";
import { SelectedThemeState } from "../../../../../state/theme-state";
import { GsmbTheme } from "../../../../../model/theme";
import { takeUntil } from "rxjs/operators";
import { EnvConstants } from "../../../../../constants";

@Component({
  selector: "app-doppel-lagensymbol",
  templateUrl: "./doppel-lagensymbol.component.html",
  styles: `
    .invert-colors {
      filter: invert(100%);
    }
  `,
})
export class DoppelLagensymbolComponent implements OnDestroy {
  @Select(DisplayedPagesState)
  private _displayedPages$!: Observable<Page[]>;

  themeBrightness$ = this._store
    .select(SelectedThemeState)
    .pipe(map((theme: GsmbTheme) => theme.brightness));

  private _destroy$ = new Subject<void>();

  displayedPages: Page[] = [];

  lagensymbol = "";

  constructor(private _store: Store) {
    this._displayedPages$
      .pipe(takeUntil(this._destroy$))
      .subscribe((dp: Page[]) => {
        this.displayedPages = dp;
        this.setLagensymbol(dp);
      });
  }

  setLagensymbol(pages: Page[]) {
    if (pages.length < 2) {
      // display nothing as we are not in a Lage,
      // we find ourselves at the Einband aussen, at a "Rücken", or have a single sheet
      this.lagensymbol = "";
      return;
    }

    const newLagensymbol = pages[0].doppellagenSym
      ? pages[0].doppellagenSym
      : pages[1].doppellagenSym;
    if (newLagensymbol) {
      if (newLagensymbol.includes("Doppelseite")) {
        this.lagensymbol = `${EnvConstants.LAGENSYM_BASE_PATH}/Doppelseite/${newLagensymbol.split("/").pop()}`;
      } else {
        // try einzelseite
        this.lagensymbol = `${EnvConstants.LAGENSYM_BASE_PATH}/Einzelseite/${newLagensymbol.split("/").pop()}`;
      }
    } else {
      this.lagensymbol = "";
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
