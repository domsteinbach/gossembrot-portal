import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { SearchResult, SearchResultTable } from '../../../model/search-result';
import { take } from 'rxjs';
import { CarrierTextRepository } from '../../../data/repository/carrier-text-repository';
import { CarrierText } from '../../../model/carriertext';
import { LinkService } from '../../pages/page-manuscript/link.service';
import { InfoCarrierRepository } from '../../../data/repository/info-carrier-repository';
import { InformationCarrier } from '../../../model/infoCarrier';
import { SearchService } from '../../../service/search-service.service';
import { SearchType } from '../../../data/repository/search-data-repository';

@Component({
  selector: 'app-search-result-group',
  templateUrl: './search-result-group.component.html',
  styleUrl: './search-result-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultGroupComponent implements OnChanges {
  @Input() type!: SearchResultTable;
  @Input() searchType: SearchType = 'unset';
  @Input() results: SearchResult[] = [];
  @Input() searchTerm = '';
  @Input() includeAuthorsFoundByAlias = true;

  expanded = true;
  showAll = false;

  private _carrierTexts: CarrierText[] = [];

  get carrierTexts(): CarrierText[] {
    return this._carrierTexts.slice(0, this.showAll ? undefined : this.search.OFFSET);
  }

  private _authorsWithTexts: {
    author: SearchResult;
    texts: CarrierText[],
    foundByAlias?: string
  }[] = [];

  get authorsWithTexts() {
    return this._authorsWithTexts.slice(0, this.showAll ? undefined : this.search.OFFSET);
  }

  private _namingsWithCarriers: {
    naming: SearchResult;
    carrier?: InformationCarrier;
  }[] = [];

  get namingsWithCarriers() {
    return this._namingsWithCarriers.slice(0, this.showAll ? undefined : this.search.OFFSET);
  }

  get typeLabel(): string {
    return this.search.TYPE_LABELS[this.type];
  }

  get displayedResults(): SearchResult[] {
    return this.results.slice(0, this.showAll ? undefined : this.search.OFFSET);
  }

  constructor(
    private _ctr: CarrierTextRepository,
    private _icr: InfoCarrierRepository,
    private _ls: LinkService,
    public search: SearchService
  ) {}

  ngOnChanges(): void {
    if (this.type === 'author') {
      this._getAuthorsWithTexts();
    }
    if (this.type === 'carrier_text') {
      this._getCarrierTexts();
    }
    if (this.type === 'naming_gossembrot') {
      this._getNamingsWithCarrier();
    }
  }

  private _getAuthorsWithTexts(): void {
    const authorIds = this.results.filter(r => r.type === 'author' && this._included(r) ).map(r => r.id);
    this._ctr.getCarrierTextsOfAuthors$(authorIds).pipe(take(1)).subscribe((texts) => {
      this._authorsWithTexts = this.results
        .map((result) => ({
          author: result,
          texts: texts.filter(text => text.authorId === result.id), // all texts, splice is later by the component
          foundByAlias: this._getFoundByAlias(result),
          searchType: this.searchType
        }))
        .sort((a, b) => {
          const aHasAlias = !!a.foundByAlias;
          const bHasAlias = !!b.foundByAlias;

          if (aHasAlias !== bHasAlias) {
            return aHasAlias ? 1 : -1; // without alias first
          }
          return a.author.label.localeCompare(b.author.label); // alphabetical
        })
    });
  }

  private _getCarrierTexts(): void {
    const carrierTextIds = this.results.filter(r => r.type === 'carrier_text').map(r => r.id);
    this._ctr.getCarrierTextsByIds$(carrierTextIds).pipe(take(1)).subscribe((texts) => {
      this._carrierTexts = texts;
    });
  }

  _getNamingsWithCarrier(){
    this._icr.informationCarriers$().pipe(
      take(1)
    ).subscribe((carriers) => {
      this._namingsWithCarriers = this.results
        .map((result) => {
          const c = carriers.find(c => c.namingsGossembrot.some(n => n.id === result.id));
          return {
            naming: result,
            carrier: c
          };
        })
    });
  }

  private _included(result: SearchResult) {
    return  this.includeAuthorsFoundByAlias || result.label.includes(this.searchTerm);
  }

  private _getFoundByAlias(result: SearchResult): string | undefined {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term || this.searchType === 'unset') {
      return result.searchString
          .split('|')
          .map(s => s.trim())
          .find(s => s.toLowerCase().includes(term));
    }

    const aliases = result.searchString
        .split('|')
        .map(alias => alias.trim());

    for (const alias of aliases) {
      const words = alias.split(/\s+/);

      for (const word of words) {
        const lw = word.toLowerCase();
        if (
            (this.searchType === 'prefix' && lw.startsWith(term)) ||
            (this.searchType === 'suffix' && lw.endsWith(term)) ||
            (this.searchType === 'fullWord' && lw === term)
        ) {
          return alias; // keep original casing
        }
      }
    }

    return undefined;
  }

  toggle(): void {
    if (!this.results.length) { return;}
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.showAll = false; // reset showAll when expanding
    }
  }

  setShowAll(val: boolean): void {
    this.showAll = val;
  }

  onResultItemClicked(result: SearchResult): void {
    switch (result.type) {
      case 'info_carrier':
        this._icr.getCarrierById$(result.id).pipe(take(1)).subscribe((carrier) => {
          if (carrier) {
            this._ls.openCarrierInNewTab(carrier);
          }
        });
        break;
      case 'naming_gossembrot':
        this._icr.getCarrierByNamingGsmbId$(result.id).pipe(take(1)).subscribe((carrier) => {
          if (carrier) {
            this._ls.openCarrierInNewTab(carrier);
          }
        });
        break;
      default:
        break;
    }
  }
}
