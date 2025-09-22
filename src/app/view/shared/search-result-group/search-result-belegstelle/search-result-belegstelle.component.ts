import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { take } from 'rxjs';
import { VerweisRepository } from '../../../../data/repository/verweis-repository';
import { SearchResult } from '../../../../model/search-result';
import { DisplayVerweis } from '../../../../model/verweis';
import { LinkService } from '../../../pages/page-manuscript/link.service';
import { SearchService } from '../../../../service/search-service.service';

interface BelegstelleWithVerweis {
    belegstelle: SearchResult;
    verweis: DisplayVerweis | undefined;
}

@Component({
  selector: 'app-search-result-belegstelle',
  templateUrl: './search-result-belegstelle.component.html',
  styleUrls: ['../search-result-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultBelegstelleComponent implements OnChanges{
  @Input() results: SearchResult[] = [];
  @Input() showAll = false;
  @Input() searchTerm = '';

  termsToHighlight: string[] = [];

  belegstellen: BelegstelleWithVerweis[] = [];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _search: SearchService,
    private _vls: LinkService,
    private _vr: VerweisRepository) {}

  ngOnChanges() {
    const belegstellenIds= this.results.filter(i => i.type === 'belegstelle').map(r => r.id);
    this._vr.getVerweiseOfSrcBelegstellen$(belegstellenIds)
      .pipe(take(1)).subscribe((verweise) => {
      this.belegstellen = this.results.map((result) => ({
        belegstelle: result,
        verweis: verweise.find(v => v.srcBelegstelle === result.id)
      })).slice(0, this.showAll ? undefined : this._search.OFFSET);
      this._cdr.markForCheck();
    });

    this.termsToHighlight = SearchService.expandWithAlternativeWritings(this.searchTerm)
  }

  onVerweisClicked(verweis: DisplayVerweis | undefined): void {
    if (verweis) {
      this._vls.openSourceCarrierOfVerweis(verweis);
    }
  }

  trackByIds(index: number, item: BelegstelleWithVerweis) {
    return `${item.belegstelle.id}-${item.verweis?.id}`;
  }
}
