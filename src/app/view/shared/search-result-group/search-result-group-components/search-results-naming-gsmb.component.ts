import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LinkService } from '../../../pages/page-manuscript/link.service';
import { InformationCarrier } from '../../../../model/infoCarrier';
import { SearchResult } from '../../../../model/search-result';

@Component({
  selector: 'app-search-results-naming-gsmb',
  template: `
    <div class="suggestion-item" *ngFor="let result of results;" (click)="onTextClicked(result.carrier)" tabindex="0" (keydown.enter)="onTextClicked(result.carrier)" (keydown.space)="onTextClicked(result.carrier)">
      <div class="value-item">
        <span>📚 </span>
        <span [innerHTML]="result.naming.label | highlight:searchTerm"></span>
        <span> [{{ result.carrier?.getCarrierTypeDescDeLowerCased('Nominativ') }}</span>
        <span [class.lost-carrier-title]="result.carrier?.physicality === 'Lost'"> {{ result.carrier?.fullTitle }}]</span>
      </div>
    </div>
  `,
  styleUrl: '../search-result-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush})

export class SearchResultsNamingGsmbComponent {
  @Input() results: { naming: SearchResult; carrier?: InformationCarrier}[] = [];
  @Input() searchTerm = '';

  constructor(
    private _linkService: LinkService
  ) {
  }

  onTextClicked(infoCarrier: InformationCarrier | undefined): void {
    if (!infoCarrier) {
      return;
    }
    this._linkService.openCarrierInNewTab(infoCarrier);
  }
}
