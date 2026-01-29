import { Component } from "@angular/core";
import { map, Observable } from "rxjs";
import { Page } from "../../../../../model/page";
import { BelegstelleRepository } from "../../../../../data/repository/belegstelle-repository";
import { UpdateSelectedPage } from "../../../../../state/app-state";
import { Store } from "@ngxs/store";

@Component({
  selector: "app-belegstellen-nav",
  templateUrl: "./belegstellen-nav.component.html",
  styleUrls: ["./belegstellen-nav.component.scss"],
})
export class BelegstellenNavComponent {
  pagesWithQuellBelegstellen$: Observable<Page[]>;

  constructor(
    private _br: BelegstelleRepository,
    private _store: Store,
  ) {
    this.pagesWithQuellBelegstellen$ = this._br
      .srcBelegstellenOfSelectedSrcCarrier$()
      .pipe(
        map((belegstellen) =>
          belegstellen
            .map((b) => b.page)
            .filter((page): page is Page => !!page),
        ),
        map((pages) =>
          Array.from(new Map(pages.map((p) => [p.id, p])).values()),
        ),
      );
  }

  onPageSelected(page: Page) {
    this._store.dispatch(new UpdateSelectedPage(page));
  }
}
