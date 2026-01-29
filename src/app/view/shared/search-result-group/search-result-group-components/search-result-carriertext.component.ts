import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CarrierText } from "../../../../model/carriertext";
import { LinkService } from "../../../pages/page-manuscript/link.service";
import { SearchService } from "../../../../service/search-service.service";

@Component({
  selector: "app-search-result-carriertext",
  template: `
    <div
      class="suggestion-item"
      *ngFor="let text of textsToDisplay"
      (click)="onTextClicked(text)"
    >
      <div class="value-item">
        📖 <span [innerHTML]="text.title | highlight: searchTerm"></span
        ><span>
          [in {{ text.carrier?.getCarrierTypeDescDeLowerCased("Dativ") }}</span
        >
        <span [class.lost-carrier-title]="text.carrier?.physicality === 'Lost'">
          {{ text.carrierFulltitle }}]</span
        >
      </div>
    </div>
    <app-show-more-toggle
      *ngIf="texts.length > search.OFFSET && this.showAllHandler"
      [results]="texts.length"
      (showAllChange)="applyShowAll($event)"
    />
  `,

  styleUrl: "../search-result-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultCarriertextComponent {
  @Input() texts: CarrierText[] = [];
  @Input() searchTerm = "";
  @Input() showAllHandler = false;

  private _showAll = false;

  get textsToDisplay() {
    return this.texts.slice(
      0,
      this._showAll || !this.showAllHandler ? undefined : this.search.OFFSET,
    );
  }

  constructor(
    public search: SearchService,
    private _linkService: LinkService,
  ) {}

  applyShowAll(val: boolean) {
    this._showAll = val;
  }

  onTextClicked(text: CarrierText): void {
    this._linkService.openTextInNewTab(text);
  }
}
