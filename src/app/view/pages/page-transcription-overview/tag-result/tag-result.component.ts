import { Component, Input } from "@angular/core";
import { RouteConstants } from "../../../../routeConstants";
import { take } from "rxjs";
import { Belegstelle } from "../../../../model/belegstelle";
import { Store } from "@ngxs/store";
import { CarriersState } from "../../../../state/information-carrier-state.service";
import { InformationCarrier } from "../../../../model/infoCarrier";

interface TagTextPart {
  text: string;
  highlight: boolean;
}

@Component({
  selector: "app-search-result",
  templateUrl: "./tag-result.component.html",
  styleUrls: ["./tag-result.component.scss"],
})
export class TagResultComponent {
  @Input() belegstellen: Belegstelle[] = [];
  @Input() displayResultsAs: "html" | "tei-xml" = "html";
  @Input() highlghtTag = "";

  carriers: InformationCarrier[] = [];

  constructor(private _store: Store) {
    this._store
      .select(CarriersState)
      .pipe(take(1))
      .subscribe((carriers) => {
        this.carriers = carriers;
      });
  }

  highlightTags(wortlaut: string, tagPattern: string): TagTextPart[] {
    const parts: TagTextPart[] = [];

    const startTag = `<${tagPattern}>`;
    const endTag = `</${tagPattern}>`;

    const wortlautArr = wortlaut.split(startTag);
    parts.push({ text: wortlautArr[0], highlight: false });

    for (let i = 1; i < wortlautArr.length; i++) {
      const innerText = wortlautArr[i].split(endTag);
      parts.push({ text: startTag + innerText[0] + endTag, highlight: true });
      parts.push({ text: innerText[1], highlight: false });
    }
    return parts;
  }

  onBelegstelleClicked(belegstelle: Belegstelle) {
    // open the carrier in a new tab
    const params = `?$${RouteConstants.QUERY_VERWEIS_PARAM}=${belegstelle}`;
    const route = `${RouteConstants.MANUSCRIPTS}/${belegstelle.carId}${params}`;
    window.open(route, "_blank");
  }

  getCarrierOfBelegstelle(
    belegstelle: Belegstelle,
  ): InformationCarrier | undefined {
    return this.carriers.find((c) => c.id === belegstelle.carId);
  }
}
