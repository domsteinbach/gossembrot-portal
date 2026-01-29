import { Component, Input, OnChanges } from "@angular/core";
import { Page } from "../../../../../model/page";

@Component({
  selector: "app-grid-tiles-view",
  templateUrl: "./grid-tiles-view.component.html",
  styleUrls: ["./grid-tiles-view.component.scss"],
})
export class GridTilesViewComponent implements OnChanges {
  @Input() pages!: Page[];
  thumbnailUrls: string[] = [];

  ngOnChanges() {
    if (!this.pages || !this.pages.length) {
      return;
    }
    this.getThumbnailUrls();
  }

  getThumbnailUrls() {
    this.thumbnailUrls = this.pages.map((p) => {
      const parts = p.iiifInfoUrl.split("/");
      parts[parts.length - 3] = "100,";
      return parts.join("/");
    });
  }
}
