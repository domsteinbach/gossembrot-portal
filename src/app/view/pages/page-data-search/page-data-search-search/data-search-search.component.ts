import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SearchResult, SearchResultTable } from '../../../../model/search-result';
import { Subject } from 'rxjs';
import { SearchService } from '../../../../service/search-service.service';
import { takeUntil } from 'rxjs/operators';
import { SearchType } from '../../../../data/repository/search-data-repository';

@Component({
  selector: 'app-data-search-search',
  templateUrl: './data-search-search.component.html',
  styleUrl: './data-search-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchService]
})
export class DataSearchSearchComponent implements OnInit, OnDestroy {
  searchTerm = '';
  searchType: SearchType = 'unset';
  resultGroups: Record<SearchResultTable, SearchResult[]> | undefined = undefined;

  visibleGroups: Partial<Record<SearchResultTable, boolean>> = {};
  private _destroy$ = new Subject<void>();

  constructor(
    private _cdr: ChangeDetectorRef,
    public search: SearchService,)
  {
    this.search.GROUP_ORDER.forEach(group => {
      this.visibleGroups[group.type] = true;
    });
  }

  ngOnInit() {
    this.search.searchResults$.pipe(takeUntil(this._destroy$)).subscribe((results: SearchResult[]) => {
      this.setResultGroups(results);
    });
  }

  doSearch(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    this.search.doSearch(this.searchTerm, this.searchType);
  }

  setResultGroups(searchResults: SearchResult[]): void {
    this.resultGroups = searchResults.reduce((groups, result) => {
      (groups[result.type] ||= []).push(result);
      return groups;
    }, {
      author: [],
      info_carrier: [],
      carrier_text: [],
      belegstelle: [],
      naming_gossembrot: [],
      library: []
    } as Record<SearchResultTable, SearchResult[]>);
    this._cdr.markForCheck();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
